-- ============================================================
-- Migration: 20261002135200_create_bonus_infrastructure_fk_fixed.sql
-- Objetivo: criar infraestrutura de bônus (tabelas, função, RLS, permissões, trigger)
-- NÃO cria seed nem campanha.
-- FK corrigida: bonus_allocations referencia APENAS bonus_campaigns(id), não bonus_target.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Tabela public.bonus_campaigns
-- ============================================================
CREATE TABLE public.bonus_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  bonus_type text NOT NULL,
  bonus_target uuid NOT NULL REFERENCES public.courses(id),
  max_allocations integer NOT NULL DEFAULT 10 CHECK (max_allocations > 0),
  allocated_count integer NOT NULL DEFAULT 0 CHECK (
    allocated_count >= 0 AND allocated_count <= max_allocations
  ),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);

-- Índice em slug já criado pela UNIQUE constraint

-- ============================================================
-- 2. Tabela public.bonus_allocations
-- FK corrigida: campaign_id referencia SOMENTE bonus_campaigns(id)
-- ============================================================
CREATE TABLE public.bonus_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.bonus_campaigns(id) ON DELETE CASCADE,
  payment_id uuid NOT NULL REFERENCES public.payments(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  course_id uuid NOT NULL REFERENCES public.courses(id),
  bonus_type text NOT NULL,
  position integer NOT NULL CHECK (position > 0),
  status text NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'revoked')),
  allocated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, payment_id),
  UNIQUE (campaign_id, user_id),
  UNIQUE (campaign_id, position)
);

-- ============================================================
-- 3. Índices extras de leitura
-- ============================================================
CREATE INDEX bonus_allocations_user_id_idx ON public.bonus_allocations(user_id);
CREATE INDEX bonus_allocations_payment_id_idx ON public.bonus_allocations(payment_id);

-- ============================================================
-- 4. RLS — Row Level Security
-- ============================================================
ALTER TABLE public.bonus_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_allocations ENABLE ROW LEVEL SECURITY;

-- bonus_campaigns: nenhuma policy para anon/authenticated
-- (acesso via service_role e SECURITY DEFINER)

-- bonus_allocations: SELECT apenas para usuário autenticado (leitura própria)
CREATE POLICY "users_read_own_bonus_allocations"
  ON public.bonus_allocations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 5. Função allocate_first_n_bonus
-- LANGUAGE plpgsql, SECURITY DEFINER
-- Valida bonus_type e bonus_target POR CÓDIGO, não por FK
-- ============================================================
CREATE FUNCTION public.allocate_first_n_bonus(
  _campaign_id uuid,
  _user_id uuid,
  _payment_id uuid,
  _bonus_type text,
  _course_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _campaign public.bonus_campaigns%ROWTYPE;
  _position integer;
  _result jsonb;
BEGIN
  -- Busca campanha com lock para prevenir race condition
  SELECT
    id, slug, name, bonus_type, bonus_target,
    max_allocations, allocated_count,
    starts_at, ends_at, is_active
  INTO _campaign
  FROM public.bonus_campaigns
  WHERE id = _campaign_id
  FOR UPDATE;

  -- Campanha não encontrada
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  -- Verificações de elegibilidade
  IF NOT _campaign.is_active THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  IF now() < _campaign.starts_at THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  IF _campaign.ends_at IS NOT NULL AND now() > _campaign.ends_at THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  IF _campaign.allocated_count >= _campaign.max_allocations THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  -- Valida bonus_type por código (não por FK)
  IF _bonus_type IS DISTINCT FROM _campaign.bonus_type THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  -- Valida course_id = bonus_target por código (não por FK composta)
  IF _course_id IS DISTINCT FROM _campaign.bonus_target THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  -- Verifica duplicidade por payment_id
  IF EXISTS (
    SELECT 1 FROM public.bonus_allocations
    WHERE campaign_id = _campaign_id AND payment_id = _payment_id
  ) THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  -- Verifica duplicidade por user_id
  IF EXISTS (
    SELECT 1 FROM public.bonus_allocations
    WHERE campaign_id = _campaign_id AND user_id = _user_id
  ) THEN
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END IF;

  -- Calcula posição: allocated_count + 1
  _position := _campaign.allocated_count + 1;

  -- Insere allocation PRIMEIRO (unique_violation pode ocorrer aqui)
  BEGIN
    INSERT INTO public.bonus_allocations (
      campaign_id, payment_id, user_id, course_id,
      bonus_type, position, status
    ) VALUES (
      _campaign_id, _payment_id, _user_id, _course_id,
      _bonus_type, _position, 'granted'
    );
  EXCEPTION WHEN unique_violation THEN
    -- Duplicidade simultânea: não incrementa contador
    RETURN jsonb_build_object(
      'granted', false,
      'position', NULL,
      'campaign_id', _campaign_id,
      'course_id', _course_id
    );
  END;

  -- Incrementa contador SOMENTE após inserção confirmada
  UPDATE public.bonus_campaigns
  SET allocated_count = allocated_count + 1
  WHERE id = _campaign_id;

  -- Retorna sucesso
  RETURN jsonb_build_object(
    'granted', true,
    'position', _position,
    'campaign_id', _campaign_id,
    'course_id', _course_id
  );
END;
$$;

-- ============================================================
-- 6. Permissões da função
-- ============================================================
REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(uuid, uuid, uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(uuid, uuid, uuid, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(uuid, uuid, uuid, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_first_n_bonus(uuid, uuid, uuid, text, uuid) TO service_role;

-- ============================================================
-- 7. Trigger de updated_at (função exclusiva)
-- ============================================================
CREATE FUNCTION public.set_bonus_campaigns_updated_at() RETURNS trigger
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

-- ============================================================
-- 8. Validação final — bloco DO $$ dentro da transação
-- ============================================================
DO $$
DECLARE
  _tbl_count integer;
  _rls_enabled boolean;
  _fn_exists boolean;
  _is_security_definer boolean;
  _service_role_has_exec boolean;
  _anon_has_exec boolean;
  _authenticated_has_exec boolean;
BEGIN
  -- Verifica existência das tabelas
  SELECT COUNT(*) INTO _tbl_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('bonus_campaigns', 'bonus_allocations');

  IF _tbl_count != 2 THEN
    RAISE EXCEPTION 'FALHA: esperado 2 tabelas, encontrado %', _tbl_count;
  END IF;

  -- Verifica RLS em bonus_campaigns
  SELECT relrowsecurity INTO _rls_enabled
  FROM pg_class
  WHERE relname = 'bonus_campaigns';

  IF NOT _rls_enabled THEN
    RAISE EXCEPTION 'FALHA: RLS não habilitada em bonus_campaigns';
  END IF;

  -- Verifica RLS em bonus_allocations
  SELECT relrowsecurity INTO _rls_enabled
  FROM pg_class
  WHERE relname = 'bonus_allocations';

  IF NOT _rls_enabled THEN
    RAISE EXCEPTION 'FALHA: RLS não habilitada em bonus_allocations';
  END IF;

  -- Verifica existência da função
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'allocate_first_n_bonus'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO _fn_exists;

  IF NOT _fn_exists THEN
    RAISE EXCEPTION 'FALHA: função allocate_first_n_bonus não encontrada';
  END IF;

  -- Verifica SECURITY DEFINER
  SELECT prosecdef INTO _is_security_definer
  FROM pg_proc
  WHERE proname = 'allocate_first_n_bonus'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  IF NOT _is_security_definer THEN
    RAISE EXCEPTION 'FALHA: função allocate_first_n_bonus não é SECURITY DEFINER';
  END IF;

  -- Verifica permissões de service_role
  SELECT HAS_FUNCTION_PRIVILEGE('service_role', 'public.allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)', 'EXECUTE')
  INTO _service_role_has_exec;

  IF NOT _service_role_has_exec THEN
    RAISE EXCEPTION 'FALHA: service_role não tem EXECUTE na função allocate_first_n_bonus';
  END IF;

  -- Verifica que anon NÃO tem EXECUTE
  SELECT HAS_FUNCTION_PRIVILEGE('anon', 'public.allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)', 'EXECUTE')
  INTO _anon_has_exec;

  IF _anon_has_exec THEN
    RAISE EXCEPTION 'FALHA: anon tem EXECUTE na função allocate_first_n_bonus (deve ser revogado)';
  END IF;

  -- Verifica que authenticated NÃO tem EXECUTE
  SELECT HAS_FUNCTION_PRIVILEGE('authenticated', 'public.allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)', 'EXECUTE')
  INTO _authenticated_has_exec;

  IF _authenticated_has_exec THEN
    RAISE EXCEPTION 'FALHA: authenticated tem EXECUTE na função allocate_first_n_bonus (deve ser revogado)';
  END IF;

  -- Tudo válido
  RAISE NOTICE 'VALIDADO: infraestrutura de bonus aplicada com sucesso.';
END;
$$;

COMMIT;
