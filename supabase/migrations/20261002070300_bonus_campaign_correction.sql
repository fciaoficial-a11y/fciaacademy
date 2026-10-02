-- ============================================================
-- Migration: bonus_campaign_correction
-- Corrige a migration 20261002063858_bonus_google_ai_pro.sql
-- que falhou com erro de sintaxe (CREATE POLICY IF NOT EXISTS).
-- Todos os objetos são recriados do zero dentro desta transação.
-- ============================================================

BEGIN;

-- Limpa objetos parciais que possam ter ficado no banco.
DROP TABLE IF EXISTS public.bonus_allocations;
DROP TABLE IF EXISTS public.bonus_campaigns;
DROP FUNCTION IF EXISTS public.allocate_bonus_course(text, uuid, uuid);

-- ── Tabela: bonus_campaigns ─────────────────────────────
CREATE TABLE public.bonus_campaigns (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text        NOT NULL UNIQUE,
  source_course_id uuid        NOT NULL REFERENCES public.courses(id),
  bonus_course_id  uuid        NOT NULL REFERENCES public.courses(id),
  max_allocations  integer     NOT NULL DEFAULT 10,
  allocated_count  integer     NOT NULL DEFAULT 0,
  is_active        boolean     NOT NULL DEFAULT true,
  starts_at        timestamptz NOT NULL DEFAULT now(),
  ends_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bonus_campaigns ENABLE ROW LEVEL SECURITY;

-- service_role gerencia campanhas livremente
CREATE POLICY "bonus_campaigns_admin_all"
  ON public.bonus_campaigns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Tabela: bonus_allocations ─────────────────────────────
CREATE TABLE public.bonus_allocations (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid        NOT NULL REFERENCES public.bonus_campaigns(id),
  payment_id   uuid        NOT NULL REFERENCES public.payments(id),
  user_id      uuid        NOT NULL REFERENCES auth.users(id),
  course_id    uuid        NOT NULL REFERENCES public.courses(id),
  position     integer     NOT NULL CHECK (position > 0),
  status       text        NOT NULL DEFAULT 'granted'
                          CHECK (status IN ('granted', 'revoked')),
  allocated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, payment_id),
  UNIQUE (campaign_id, user_id),
  UNIQUE (campaign_id, position)
);

ALTER TABLE public.bonus_allocations ENABLE ROW LEVEL SECURITY;

-- service_role gerencia alocações livremente
CREATE POLICY "bonus_allocations_admin_all"
  ON public.bonus_allocations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Aluno autenticado pode consultar apenas suas próprias alocações
CREATE POLICY "bonus_allocations_user_select_own"
  ON public.bonus_allocations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ── Função: allocate_bonus_course ─────────────────────────
-- Chamada pelo webhook Asaas para alocar o bônus de forma
-- concorrente-segura (SELECT FOR UPDATE + validações atômicas).
CREATE FUNCTION public.allocate_bonus_course(
  _campaign_slug text,
  _payment_id    uuid,
  _user_id       uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _campaign       public.bonus_campaigns%ROWTYPE;
  _next_position  integer;
BEGIN
  -- Busca campanha com lock de linha (previne race condition)
  SELECT * INTO _campaign
  FROM public.bonus_campaigns
  WHERE slug = _campaign_slug
  FOR UPDATE;

  -- Campanha inexistente
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'granted',          false,
      'position',         null,
      'bonus_course_id',  null,
      'reason',           'campaign_not_found'
    );
  END IF;

  -- Campanha inativa
  IF NOT _campaign.is_active THEN
    RETURN jsonb_build_object(
      'granted',          false,
      'position',         null,
      'bonus_course_id',  null,
      'reason',           'campaign_inactive'
    );
  END IF;

  -- Fora do período de vigência
  IF _campaign.starts_at > now() THEN
    RETURN jsonb_build_object(
      'granted',          false,
      'position',         null,
      'bonus_course_id',  null,
      'reason',           'campaign_not_started'
    );
  END IF;

  IF _campaign.ends_at IS NOT NULL AND _campaign.ends_at < now() THEN
    RETURN jsonb_build_object(
      'granted',          false,
      'position',         null,
      'bonus_course_id',  null,
      'reason',           'campaign_ended'
    );
  END IF;

  -- Limite de vagas atingido
  IF _campaign.allocated_count >= _campaign.max_allocations THEN
    RETURN jsonb_build_object(
      'granted',          false,
      'position',         null,
      'bonus_course_id',  null,
      'reason',           'no_slots_available'
    );
  END IF;

  -- Duplicidade: pagamento ou usuário já recebeu bônus nesta campanha
  IF EXISTS (
    SELECT 1 FROM public.bonus_allocations
    WHERE campaign_id = _campaign.id
      AND (payment_id = _payment_id OR user_id = _user_id)
  ) THEN
    RETURN jsonb_build_object(
      'granted',          false,
      'position',         null,
      'bonus_course_id',  null,
      'reason',           'already_allocated'
    );
  END IF;

  -- Tudo válido: calcula posição e insere alocação
  _next_position := _campaign.allocated_count + 1;

  INSERT INTO public.bonus_allocations
    (campaign_id, payment_id, user_id, course_id, position, status)
  VALUES
    (_campaign.id, _payment_id, _user_id, _campaign.bonus_course_id, _next_position, 'granted');

  -- Só incrementa após o INSERT confirmar (evita inconsistência se o UPDATE falhar)
  UPDATE public.bonus_campaigns
  SET allocated_count = allocated_count + 1,
      updated_at       = now()
  WHERE id = _campaign.id;

  RETURN jsonb_build_object(
    'granted',          true,
    'position',         _next_position,
    'bonus_course_id',  _campaign.bonus_course_id,
    'reason',           null
  );
END;
$$;

-- RPC exposta apenas para service_role (backend)
REVOKE EXECUTE ON FUNCTION public.allocate_bonus_course(text, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.allocate_bonus_course(text, uuid, uuid) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.allocate_bonus_course(text, uuid, uuid) TO service_role;

-- ── Seed: campanha Google AI Pro — 10 primeiros ────────────
-- bonus_course_id é resolvido via subquery (UUID real de metodo-ia-criativa no banco).
-- ON CONFLICT protege contra reexecução.
INSERT INTO public.bonus_campaigns
  (slug, source_course_id, bonus_course_id, max_allocations, allocated_count, is_active)
SELECT
  'google-ai-pro-10-first',
  '18ddfd2c-4a9b-4e6f-b9f0-6c3e8a1d2b4f'::uuid,  -- source: Google AI Pro (produto de checkout)
  id,                                               -- bonus: Método IA Criativa (slug = metodo-ia-criativa)
  10,
  0,
  true
FROM public.courses
WHERE slug = 'metodo-ia-criativa'
ON CONFLICT (slug) DO NOTHING;

COMMIT;
