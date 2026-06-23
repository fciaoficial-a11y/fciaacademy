
-- Plans table
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','expired','trialing','past_due')),
  provider TEXT,
  provider_subscription_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON public.subscriptions(user_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subs" ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage subs" ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Mark tracks with required plan tier
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS required_plan TEXT NOT NULL DEFAULT 'free'
  CHECK (required_plan IN ('free','starter','pro','expert'));

-- Seed plans
INSERT INTO public.plans (id, name, price, features, sort_order) VALUES
  ('free','Free',0,'["Cursos gratuitos","Acesso ao dashboard","Gamificação básica"]'::jsonb,1),
  ('starter','Starter',29.90,'["Tudo do Free","1 trilha premium","Certificados ilimitados"]'::jsonb,2),
  ('pro','Pro',79.90,'["Tudo do Starter","Todas as trilhas premium","Suporte prioritário"]'::jsonb,3),
  ('expert','Expert',149.90,'["Tudo do Pro","Recursos exclusivos","Mentoria mensal","Conteúdos avançados"]'::jsonb,4)
ON CONFLICT (id) DO NOTHING;

-- Helper: get current plan id for a user
CREATE OR REPLACE FUNCTION public.current_plan(_user UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT plan_id FROM public.subscriptions
    WHERE user_id = _user
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY started_at DESC
    LIMIT 1
  ), 'free');
$$;

-- Plan tier rank
CREATE OR REPLACE FUNCTION public.plan_rank(_plan TEXT)
RETURNS INTEGER
LANGUAGE SQL IMMUTABLE
AS $$
  SELECT CASE _plan
    WHEN 'free' THEN 0
    WHEN 'starter' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'expert' THEN 3
    ELSE 0
  END;
$$;

-- Check track access
CREATE OR REPLACE FUNCTION public.can_access_track(_user UUID, _track UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.plan_rank(public.current_plan(_user)) >= public.plan_rank(
    COALESCE((SELECT required_plan FROM public.tracks WHERE id = _track), 'free')
  );
$$;

-- Auto-create FREE subscription on signup
CREATE OR REPLACE FUNCTION public.assign_free_plan()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_assign_free_plan ON auth.users;
CREATE TRIGGER on_auth_user_assign_free_plan
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_free_plan();

-- Backfill: existing users get free plan
INSERT INTO public.subscriptions (user_id, plan_id, status)
SELECT id, 'free', 'active' FROM auth.users
ON CONFLICT DO NOTHING;
