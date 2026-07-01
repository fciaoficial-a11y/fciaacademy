CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  provider TEXT NOT NULL DEFAULT 'asaas' CHECK (provider IN ('asaas')),
  provider_payment_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','received','confirmed','overdue','refunded','chargeback','cancelled','failed')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL' CHECK (currency = 'BRL'),
  billing_type TEXT NOT NULL DEFAULT 'PIX' CHECK (billing_type = 'PIX'),
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  invoice_url TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_payment_id)
);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

CREATE INDEX IF NOT EXISTS idx_payments_user_created ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment ON public.payments(provider, provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_course ON public.payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_plan ON public.payments(plan_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP TRIGGER IF EXISTS trg_payments_updated ON public.payments;
CREATE TRIGGER trg_payments_updated
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.grant_paid_access(_user_id UUID, _plan_id TEXT, _course_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT := COALESCE(NULLIF(_plan_id, ''), 'free');
  v_track UUID;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_required';
  END IF;

  INSERT INTO public.subscriptions (user_id, plan_id, status, started_at, expires_at)
  VALUES (_user_id, v_plan, 'active', now(), now() + interval '30 days')
  ON CONFLICT DO NOTHING;

  UPDATE public.profiles
     SET plan = v_plan,
         updated_at = now()
   WHERE id = _user_id;

  IF _course_id IS NOT NULL THEN
    SELECT track_id INTO v_track FROM public.courses WHERE id = _course_id;
    INSERT INTO public.enrollments (user_id, course_id, track_id, plan_at_enrollment)
    VALUES (_user_id, _course_id, v_track, v_plan)
    ON CONFLICT (user_id, course_id)
      DO UPDATE SET plan_at_enrollment = v_plan,
                    last_accessed_at = now(),
                    updated_at = now();
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_paid_access(UUID, TEXT, UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.has_course_access(_user UUID, _course UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses c
    LEFT JOIN public.tracks t ON t.id = c.track_id
    WHERE c.id = _course
      AND c.is_published = true
      AND (
        public.plan_rank(public.current_plan(_user)) >= public.plan_rank(COALESCE(t.required_plan, 'free'))
        OR EXISTS (
          SELECT 1
          FROM public.enrollments e
          WHERE e.user_id = _user
            AND e.course_id = _course
        )
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_course_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_course_access(UUID, UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_list_payments()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  course_id UUID,
  course_title TEXT,
  plan_id TEXT,
  provider TEXT,
  provider_payment_id TEXT,
  status TEXT,
  amount NUMERIC,
  currency TEXT,
  billing_type TEXT,
  invoice_url TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
    SELECT p.id,
           p.user_id,
           u.email::TEXT,
           pr.full_name,
           p.course_id,
           c.title,
           p.plan_id,
           p.provider,
           p.provider_payment_id,
           p.status,
           p.amount,
           p.currency,
           p.billing_type,
           p.invoice_url,
           p.due_date,
           p.paid_at,
           p.created_at
    FROM public.payments p
    LEFT JOIN auth.users u ON u.id = p.user_id
    LEFT JOIN public.profiles pr ON pr.id = p.user_id
    LEFT JOIN public.courses c ON c.id = p.course_id
    ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_payments() TO authenticated;