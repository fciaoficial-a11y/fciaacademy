-- Migration: bonus_campaigns + bonus_allocations + allocate_bonus_course
-- Campanha: Google AI Pro oferta — libera Masterclass para os 10 primeiros pagantes
--
-- NOTA: Substitua <MASTERCLASS_UUID> pelo UUID real de metodo-ia-criativa:
--   SELECT id FROM public.courses WHERE slug = 'metodo-ia-criativa';
--

------------------------------------------------------------
-- Tabela: bonus_campaigns
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bonus_campaigns (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  slug             text        NOT NULL UNIQUE,
  source_course_id uuid        NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  bonus_course_id  uuid        NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  max_allocations  integer     NOT NULL DEFAULT 10,
  allocated_count  integer     NOT NULL DEFAULT 0,
  is_active        boolean     NOT NULL DEFAULT true,
  starts_at        timestamptz NOT NULL DEFAULT now(),
  ends_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT  bonus_campaigns_max_positive   CHECK (max_allocations > 0),
  CONSTRAINT  bonus_campaigns_alloc_not_neg  CHECK (allocated_count >= 0),
  CONSTRAINT  bonus_campaigns_within_limit   CHECK (allocated_count <= max_allocations)
);

-- Habilita RLS se ainda não estiver
ALTER TABLE public.bonus_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy admin-only: só admin/service_role gerencia campanhas
CREATE POLICY IF NOT EXISTS "admin_manage_bonus_campaigns"
  ON public.bonus_campaigns
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

------------------------------------------------------------
-- Tabela: bonus_allocations
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bonus_allocations (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  campaign_id  uuid        NOT NULL REFERENCES public.bonus_campaigns(id) ON DELETE CASCADE,
  payment_id   uuid        NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    uuid        NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  position     integer     NOT NULL,
  status       text        NOT NULL DEFAULT 'granted'
                           CHECK (status IN ('granted', 'revoked')),
  allocated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bonus_allocations_pk        PRIMARY KEY (id),
  CONSTRAINT bonus_allocations_camp_pay  UNIQUE (campaign_id, payment_id),
  CONSTRAINT bonus_allocations_camp_user UNIQUE (campaign_id, user_id),
  CONSTRAINT bonus_allocations_camp_pos  UNIQUE (campaign_id, position),
  CONSTRAINT bonus_allocations_pos_positive CHECK (position > 0)
);

-- Habilita RLS se ainda não estiver
ALTER TABLE public.bonus_allocations ENABLE ROW LEVEL SECURITY;

-- Policy: aluno autenticado lê apenas as próprias alocações
CREATE POLICY IF NOT EXISTS "user_read_own_allocations"
  ON public.bonus_allocations
  FOR SELECT
  USING (auth.uid() = user_id);

------------------------------------------------------------
-- Função: allocate_bonus_course
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.allocate_bonus_course(
  _campaign_slug text,
  _payment_id    uuid,
  _user_id       uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _campaign     bonus_campaigns%ROWTYPE;
  _granted      boolean := false;
  _position     integer  := NULL;
  _bonus_cid    uuid     := NULL;
BEGIN
  -- Busca e trava a campanha (SELECT FOR UPDATE impede race condition)
  SELECT * INTO _campaign
  FROM bonus_campaigns
  WHERE slug = _campaign_slug
  FOR UPDATE;

  -- Campanha inexistente
  IF NOT FOUND THEN
    RETURN jsonb_build_object('granted', false, 'position', NULL, 'bonus_course_id', NULL);
  END IF;

  -- Fora do período ou inativa
  IF NOT _campaign.is_active
     OR _campaign.starts_at > now()
     OR (_campaign.ends_at IS NOT NULL AND _campaign.ends_at < now())
     OR _campaign.allocated_count >= _campaign.max_allocations THEN
    RETURN jsonb_build_object('granted', false, 'position', NULL, 'bonus_course_id', NULL);
  END IF;

  -- Allocate atômica
  _position   := _campaign.allocated_count + 1;
  _bonus_cid  := _campaign.bonus_course_id;

  BEGIN
    INSERT INTO bonus_allocations (campaign_id, payment_id, user_id, course_id, position)
    VALUES (_campaign.id, _payment_id, _user_id, _bonus_cid, _position);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('granted', false, 'position', NULL, 'bonus_course_id', NULL);
  END;

  UPDATE bonus_campaigns
  SET allocated_count = allocated_count + 1,
      updated_at       = now()
  WHERE id = _campaign.id;

  RETURN jsonb_build_object('granted', true, 'position', _position, 'bonus_course_id', _bonus_cid);
END;
$$;

-- service_role executa; anon/authenticated não chamam diretamente
REVOKE ALL ON FUNCTION public.allocate_bonus_course(text, uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.allocate_bonus_course(text, uuid, uuid) TO service_role;

------------------------------------------------------------
-- Seed: campanha Google AI Pro — 10 primeiros pagantes
--
-- 1) Descubra o UUID da Masterclass:
--    SELECT id FROM public.courses WHERE slug = 'metodo-ia-criativa';
-- 2) Substitua <MASTERCLASS_UUID> abaixo antes de aplicar.
------------------------------------------------------------
INSERT INTO public.bonus_campaigns
  (slug, source_course_id, bonus_course_id, max_allocations, allocated_count, is_active)
VALUES
  (
    'google-ai-pro-10-first',
    '18ddfd2c-4a9b-4e6f-b9f0-6c3e8a1d2b4f'::uuid,
    '<MASTERCLASS_UUID>'::uuid,  -- TODO: substituir pelo UUID real de metodo-ia-criativa
    10,
    0,
    true
  )
ON CONFLICT (slug) DO NOTHING;
