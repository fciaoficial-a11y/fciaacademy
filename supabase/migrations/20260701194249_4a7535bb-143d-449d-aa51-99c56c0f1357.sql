
-- 1) Adiciona preço em cursos (compra avulsa)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS price NUMERIC(12,2) NOT NULL DEFAULT 0;

-- 2) Curso teste vira compra avulsa a R$ 1,00
UPDATE public.courses SET price = 1.00 WHERE slug = 'curso-teste-fcia';

-- 3) Trilha de teste deixa de exigir plano — acesso via compra do curso
UPDATE public.tracks SET required_plan = 'free' WHERE slug = 'teste-fcia';

-- 4) grant_paid_access: suporta compra avulsa via plan_id = 'course_purchase'
CREATE OR REPLACE FUNCTION public.grant_paid_access(_user_id uuid, _plan_id text, _course_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan TEXT := COALESCE(NULLIF(_plan_id, ''), 'free');
  v_track UUID;
  v_subscription_id UUID;
  v_expires TIMESTAMPTZ;
  v_is_course_purchase BOOLEAN := (v_plan = 'course_purchase');
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_required';
  END IF;

  -- Compra avulsa: apenas cria enrollment no curso, sem alterar plano/subscription
  IF v_is_course_purchase THEN
    IF _course_id IS NULL THEN
      RAISE EXCEPTION 'course_required_for_course_purchase';
    END IF;
    SELECT track_id INTO v_track FROM public.courses WHERE id = _course_id;
    INSERT INTO public.enrollments (user_id, course_id, track_id, plan_at_enrollment)
    VALUES (_user_id, _course_id, v_track, 'course_purchase')
    ON CONFLICT (user_id, course_id)
      DO UPDATE SET plan_at_enrollment = 'course_purchase',
                    last_accessed_at = now(),
                    updated_at = now();
    RETURN;
  END IF;

  -- Fluxo de assinatura (plano recorrente)
  SELECT id, expires_at INTO v_subscription_id, v_expires
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND status = 'active'
    AND provider = 'asaas'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY started_at DESC
  LIMIT 1;

  IF v_subscription_id IS NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, provider, started_at, expires_at)
    VALUES (_user_id, v_plan, 'active', 'asaas', now(), now() + interval '30 days');
  ELSE
    UPDATE public.subscriptions
       SET plan_id = v_plan,
           status = 'active',
           expires_at = CASE
             WHEN v_expires IS NULL OR v_expires < now() + interval '25 days'
               THEN now() + interval '30 days'
             ELSE v_expires
           END,
           updated_at = now()
     WHERE id = v_subscription_id;
  END IF;

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
$function$;
