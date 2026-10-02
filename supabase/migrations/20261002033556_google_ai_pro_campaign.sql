-- ============================================================
-- Google AI Pro — infraestrutura de catálogo e bônus
-- Executar ANTES de criar o seed da campanha
-- ============================================================

BEGIN;

-- ── 1. produto em courses ──────────────────────────────────
INSERT INTO public.courses (
  id,
  slug,
  title,
  description,
  price,
  is_published,
  is_free,
  product_type,
  level,
  workload_hours,
  duration_minutes,
  cover_url,
  sort_order
) VALUES (
  gen_random_uuid(),
  'google-ai-pro',
  'Google AI Pro — 18 meses',
  'Acesso à plataforma Google AI Pro por 18 meses. Ativação por convite enviado ao e-mail informado no checkout.',
  149.90,
  true,
  false,
  'course',
  'product',
  0,
  0,
  NULL,
  9999
)
ON CONFLICT (slug) DO NOTHING;

-- ── 2. bonus_campaigns ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bonus_campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  bonus_type      text NOT NULL,
  bonus_target    uuid,
  max_allocations integer NOT NULL DEFAULT 10,
  allocated_count integer NOT NULL DEFAULT 0,
  starts_at       timestamptz DEFAULT now(),
  ends_at         timestamptz,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.bonus_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_writes_bonus_campaigns"
  ON public.bonus_campaigns FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "service_writes_bonus_campaigns"
  ON public.bonus_campaigns FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed da campanha
-- ⚠️  bonus_target: substituir '<UUID_METODO_IA_CRIATIVA>' pelo course_id real
--     UPDATE bonus_campaigns SET bonus_target = '<UUID>' WHERE slug = 'google-ai-pro-launch';
INSERT INTO public.bonus_campaigns (slug, name, bonus_type, bonus_target, max_allocations)
VALUES (
  'google-ai-pro-launch',
  'Google AI Pro — Lançamento',
  'masterclass_enrollment',
  '<UUID_METODO_IA_CRIATIVA>',
  10
)
ON CONFLICT (slug) DO NOTHING;

-- ── 3. bonus_allocations ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bonus_allocations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid REFERENCES public.bonus_campaigns(id) ON DELETE CASCADE,
  payment_id   uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_type   text NOT NULL,
  course_id    uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  position     integer NOT NULL CHECK (position > 0),
  status       text NOT NULL DEFAULT 'granted'
                  CHECK (status IN ('granted', 'revoked')),
  allocated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bonus_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sees_own_bonus_allocations"
  ON public.bonus_allocations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "admin_writes_bonus_allocations"
  ON public.bonus_allocations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "service_writes_bonus_allocations"
  ON public.bonus_allocations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS
  bonus_alloc_uniq_campaign_payment
  ON public.bonus_allocations(campaign_id, payment_id);

CREATE UNIQUE INDEX IF NOT EXISTS
  bonus_alloc_uniq_campaign_user
  ON public.bonus_allocations(campaign_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS
  bonus_alloc_uniq_campaign_position
  ON public.bonus_allocations(campaign_id, position);

-- ── 4. Função atômica de alocação ───────────────────────────
CREATE OR REPLACE FUNCTION public.allocate_first_n_bonus(
  _campaign_id uuid,
  _user_id     uuid,
  _payment_id  uuid,
  _bonus_type  text,
  _course_id   uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _max_alloc  integer;
  _current    integer;
  _next_pos   integer;
  _granted    boolean := false;
BEGIN
  SELECT max_allocations, allocated_count
    INTO _max_alloc, _current
    FROM bonus_campaigns
    WHERE id = _campaign_id
    FOR UPDATE;

  IF _max_alloc IS NULL THEN
    RETURN jsonb_build_object(
      'granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', _course_id, 'reason', 'campaign_not_found'
    );
  END IF;

  IF is_active = false
     OR (starts_at IS NOT NULL AND starts_at > now())
     OR (ends_at   IS NOT NULL AND ends_at   < now())
  THEN
    RETURN jsonb_build_object(
      'granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', _course_id, 'reason', 'campaign_not_active'
    );
  END IF;

  IF _current >= _max_alloc THEN
    RETURN jsonb_build_object(
      'granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', _course_id, 'reason', 'limit_reached'
    );
  END IF;

  SELECT COALESCE(MAX(position), 0) + 1
    INTO _next_pos
    FROM bonus_allocations
    WHERE campaign_id = _campaign_id;

  INSERT INTO bonus_allocations
    (campaign_id, payment_id, user_id, bonus_type, course_id, position)
  VALUES
    (_campaign_id, _payment_id, _user_id, _bonus_type, _course_id, _next_pos)
  ON CONFLICT (campaign_id, payment_id) DO NOTHING
  ON CONFLICT (campaign_id, user_id)   DO NOTHING;

  GET DIAGNOSTICS _granted = ROW_COUNT;

  IF _granted = 1 THEN
    UPDATE bonus_campaigns
       SET allocated_count = allocated_count + 1,
           updated_at      = now()
     WHERE id = _campaign_id;
    RETURN jsonb_build_object(
      'granted', true, 'position', _next_pos,
      'campaign_id', _campaign_id, 'course_id', _course_id
    );
  END IF;

  RETURN jsonb_build_object(
    'granted', false, 'position', null,
    'campaign_id', _campaign_id, 'course_id', _course_id, 'reason', 'concurrent_allocation'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.allocate_first_n_bonus(uuid, uuid, uuid, text, uuid)
  FROM authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_first_n_bonus(uuid, uuid, uuid, text, uuid)
  TO service_role;

-- ── 5. Grants e triggers ────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bonus_campaigns TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bonus_allocations TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.bonus_campaigns_id_seq TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.bonus_allocations_id_seq TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_bonus_campaigns_updated_at ON public.bonus_campaigns;
CREATE TRIGGER trg_bonus_campaigns_updated_at
  BEFORE UPDATE ON public.bonus_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
