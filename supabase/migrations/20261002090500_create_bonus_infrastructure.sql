-- FCIA Academy — Infraestrutura de campanhas de bônus (aditiva)
-- Timestamp: 20261002090500
-- Objetos: bonus_campaigns, bonus_allocations, allocate_first_n_bonus + RLS + trigger
-- NÃO cria seed; NÃO modifica objetos existentes

BEGIN;

-- ============================================================================
-- 1) TABELAS
-- ============================================================================

CREATE TABLE public.bonus_campaigns (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  slug            text        NOT NULL,
  name            text        NOT NULL,
  bonus_type      text        NOT NULL,
  bonus_target    uuid        NOT NULL REFERENCES public.courses(id),
  max_allocations integer     NOT NULL DEFAULT 10 CHECK (max_allocations > 0),
  allocated_count integer     NOT NULL DEFAULT 0 CHECK (
    allocated_count >= 0 AND allocated_count <= max_allocations
  ),
  starts_at       timestamptz NOT NULL DEFAULT now(),
  ends_at         timestamptz,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bonus_campaigns_slug_unique UNIQUE (slug),
  CONSTRAINT bonus_campaigns_ends_after_start CHECK (
    ends_at IS NULL OR ends_at > starts_at
  )
);

COMMENT ON TABLE public.bonus_campaigns IS 'Campanhas de bônus para os N primeiros pagantes.';

CREATE TABLE public.bonus_allocations (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid        NOT NULL REFERENCES public.bonus_campaigns(id) ON DELETE CASCADE,
  payment_id  uuid        NOT NULL REFERENCES public.payments(id),
  user_id     uuid        NOT NULL REFERENCES auth.users(id),
  course_id   uuid        NOT NULL REFERENCES public.courses(id),
  bonus_type  text        NOT NULL,
  position    integer     NOT NULL CHECK (position > 0),
  status      text        NOT NULL DEFAULT 'granted'
                  CHECK (status IN ('granted', 'revoked')),
  allocated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bonus_allocations_campaign_payment_unique
    UNIQUE (campaign_id, payment_id),
  CONSTRAINT bonus_allocations_campaign_user_unique
    UNIQUE (campaign_id, user_id),
  CONSTRAINT bonus_allocations_campaign_position_unique
    UNIQUE (campaign_id, position)
);

COMMENT ON TABLE public.bonus_allocations IS
  'Registro de cada bônus alocado a um pagamento/usuário dentro de uma campanha.';

-- ============================================================================
-- 2) ÍNDICES (complementam os UNIQUE constraints)
-- ============================================================================

CREATE INDEX bonus_allocations_user_id_idx
  ON public.bonus_allocations (user_id);

CREATE INDEX bonus_allocations_payment_id_idx
  ON public.bonus_allocations (payment_id);

CREATE INDEX bonus_campaigns_slug_idx
  ON public.bonus_campaigns (slug);

-- ============================================================================
-- 3) RLS
-- ============================================================================

ALTER TABLE public.bonus_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_allocations ENABLE ROW LEVEL SECURITY;

-- bonus_campaigns: nenhuma policy para anon/authenticated (somente service_role acessa)
-- bonus_allocations: SELECT apenas para o próprio usuário
CREATE POLICY bonus_allocations_select_own
  ON public.bonus_allocations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 4) FUNÇÃO allocate_first_n_bonus
-- ============================================================================

CREATE OR REPLACE FUNCTION public.allocate_first_n_bonus(
  _campaign_id uuid,
  _user_id     uuid,
  _payment_id  uuid,
  _bonus_type text,
  _course_id   uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _campaign       public.bonus_campaigns%ROWTYPE;
  _position       integer;
  _granted        boolean := false;
  _result         jsonb;
BEGIN
  -- Busca campanha com lock de linha para evitar race condition
  SELECT
    id, slug, name, bonus_type, bonus_target,
    max_allocations, allocated_count,
    starts_at, ends_at, is_active
  INTO _campaign
  FROM public.bonus_campaigns
  WHERE id = _campaign_id
  FOR UPDATE;

  -- Campanha inexistente
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'granted',      false,
      'position',     null,
      'campaign_id',  _campaign_id,
      'course_id',    null
    );
  END IF;

  -- Verificações de elegibilidade
  IF NOT _campaign.is_active THEN
    RETURN jsonb_build_object('granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', null);
  END IF;

  IF now() < _campaign.starts_at THEN
    RETURN jsonb_build_object('granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', null);
  END IF;

  IF _campaign.ends_at IS NOT NULL AND now() > _campaign.ends_at THEN
    RETURN jsonb_build_object('granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', null);
  END IF;

  IF _campaign.bonus_type <> _bonus_type THEN
    RETURN jsonb_build_object('granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', null);
  END IF;

  IF _campaign.bonus_target <> _course_id THEN
    RETURN jsonb_build_object('granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', null);
  END IF;

  -- Verifica se ainda há vagas (leitura após FOR UPDATE = valor atual real)
  IF _campaign.allocated_count >= _campaign.max_allocations THEN
    RETURN jsonb_build_object('granted', false, 'position', null,
      'campaign_id', _campaign_id, 'course_id', null);
  END IF;

  -- Posição que este usuário ocupará
  _position := _campaign.allocated_count + 1;

  -- Insere a allocation
  -- unique_violation (23505) cobre duplicidade de payment_id E user_id
  BEGIN
    INSERT INTO public.bonus_allocations
      (campaign_id, payment_id, user_id, course_id, bonus_type, position, status)
    VALUES
      (_campaign_id, _payment_id, _user_id, _campaign.bonus_target,
       _bonus_type, _position, 'granted');

    _granted := true;

    -- Incrementa contador após inserção confirmada
    UPDATE public.bonus_campaigns
    SET allocated_count = allocated_count + 1
    WHERE id = _campaign_id;

  EXCEPTION WHEN unique_violation THEN
    -- payment_id duplicado na campanha → não incrementa
    _granted := false;
    _position := NULL;
  END;

  RETURN jsonb_build_object(
    'granted',     _granted,
    'position',    _position,
    'campaign_id', _campaign_id,
    'course_id',   _campaign.bonus_target
  );
END;
$$;

-- ============================================================================
-- 5) PERMISSÕES DA FUNÇÃO
-- ============================================================================

REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(
  uuid, uuid, uuid, text, uuid
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(
  uuid, uuid, uuid, text, uuid
) FROM anon;

REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(
  uuid, uuid, uuid, text, uuid
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.allocate_first_n_bonus(
  uuid, uuid, uuid, text, uuid
) TO service_role;

-- ============================================================================
-- 6) TRIGGER updated_at para bonus_campaigns
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_bonus_campaigns_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bonus_campaigns_updated_at
  BEFORE UPDATE ON public.bonus_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_bonus_campaigns_updated_at();

-- ============================================================================
-- 7) VALIDAÇÕES FINAIS (falham e fazem rollback se algo estiver errado)
-- ============================================================================

-- Tabelas existem
IF NOT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'bonus_campaigns'
) THEN
  RAISE EXCEPTION 'bonus_campaigns não foi criada.';
END IF;

IF NOT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'bonus_allocations'
) THEN
  RAISE EXCEPTION 'bonus_allocations não foi criada.';
END IF;

-- RLS ativada
IF NOT EXISTS (
  SELECT 1 FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'bonus_campaigns'
    AND c.relrowsecurity
) THEN
  RAISE EXCEPTION 'RLS não está ativa em bonus_campaigns.';
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'bonus_allocations'
    AND c.relrowsecurity
) THEN
  RAISE EXCEPTION 'RLS não está ativa em bonus_allocations.';
END IF;

-- Função existe e é SECURITY DEFINER
IF NOT EXISTS (
  SELECT 1 FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'allocate_first_n_bonus'
    AND p.prosecdef
    AND pg_get_function_identity_arguments(p.oid)
        = 'uuid, uuid, uuid, text, uuid'
) THEN
  RAISE EXCEPTION 'allocate_first_n_bonus não existe ou não é SECURITY DEFINER.';
END IF;

-- Permissão de service_role concedida
IF NOT EXISTS (
  SELECT 1 FROM information_schema.routine_usage_privileges
  WHERE routine_schema = 'public'
    AND specific_name LIKE '%allocate_first_n_bonus%'
    AND privilege_type = 'EXECUTE'
    AND grantee = 'service_role'
) THEN
  RAISE EXCEPTION 'service_role não tem EXECUTE em allocate_first_n_bonus.';
END IF;

-- Nenhuma permissão para anon
IF EXISTS (
  SELECT 1 FROM information_schema.routine_usage_privileges
  WHERE routine_schema = 'public'
    AND specific_name LIKE '%allocate_first_n_bonus%'
    AND privilege_type = 'EXECUTE'
    AND grantee = 'anon'
) THEN
  RAISE EXCEPTION 'anon tem EXECUTE em allocate_first_n_bonus (deveria estar revogado).';
END IF;

-- Nenhuma permissão para authenticated
IF EXISTS (
  SELECT 1 FROM information_schema.routine_usage_privileges
  WHERE routine_schema = 'public'
    AND specific_name LIKE '%allocate_first_n_bonus%'
    AND privilege_type = 'EXECUTE'
    AND grantee = 'authenticated'
) THEN
  RAISE EXCEPTION 'authenticated tem EXECUTE em allocate_first_n_bonus (deveria estar revogado).';
END IF;

-- Trigger existe
IF NOT EXISTS (
  SELECT 1 FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'bonus_campaigns'
    AND t.tgname = 'trg_bonus_campaigns_updated_at'
    AND NOT t.tgisinternal
) THEN
  RAISE EXCEPTION 'Trigger trg_bonus_campaigns_updated_at não foi criado.';
END IF;

-- Confirma que nenhuma campanha foi inserida
IF EXISTS (SELECT 1 FROM public.bonus_campaigns) THEN
  RAISE EXCEPTION 'Seed detectado em bonus_campaigns; esta migration é apenas infraestrutura.';
END IF;

COMMIT;
