-- ============================================================
-- Infrastructure: bonus_campaigns + bonus_allocations + allocate_first_n_bonus
-- Timestamp: 20261002124500
-- Scope: aditiva — nenhuma campanha, nenhum seed
-- ============================================================

BEGIN;

-- ----------------------------------------------------------
-- 1. bonus_campaigns
-- ----------------------------------------------------------
CREATE TABLE public.bonus_campaigns (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  slug             text        NOT NULL UNIQUE,
  name             text        NOT NULL,
  bonus_type       text        NOT NULL,
  bonus_target    uuid        NOT NULL REFERENCES public.courses(id),
  max_allocations  integer     NOT NULL DEFAULT 10
                         CHECK (max_allocations > 0),
  allocated_count  integer     NOT NULL DEFAULT 0
                         CHECK (allocated_count >= 0
                            AND allocated_count <= max_allocations),
  starts_at        timestamptz NOT NULL DEFAULT now(),
  ends_at          timestamptz,
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);

ALTER TABLE public.bonus_campaigns ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- 2. bonus_allocations
-- ----------------------------------------------------------
CREATE TABLE public.bonus_allocations (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  campaign_id   uuid        NOT NULL
                         REFERENCES public.bonus_campaigns(id) ON DELETE CASCADE,
  payment_id    uuid        NOT NULL REFERENCES public.payments(id),
  user_id       uuid        NOT NULL REFERENCES auth.users(id),
  course_id     uuid        NOT NULL REFERENCES public.courses(id),
  bonus_type    text        NOT NULL,
  position      integer     NOT NULL CHECK (position > 0),
  status        text        NOT NULL DEFAULT 'granted'
                         CHECK (status IN ('granted', 'revoked')),
  allocated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, payment_id),
  UNIQUE (campaign_id, user_id),
  UNIQUE (campaign_id, position)
);

ALTER TABLE public.bonus_allocations ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- 3. Índices de leitura (UNIQUE já cria índice para slug e uniques)
-- ----------------------------------------------------------
CREATE INDEX idx_bonus_allocations_user_id   ON public.bonus_allocations(user_id);
CREATE INDEX idx_bonus_allocations_payment_id ON public.bonus_allocations(payment_id);

-- ----------------------------------------------------------
-- 4. RLS policies
-- ----------------------------------------------------------
-- bonus_campaigns: nenhuma policy (somente service_role acessa via SECURITY DEFINER)

-- bonus_allocations: SELECT para usuário autenticado ver suas próprias alocações
CREATE POLICY bonus_allocations_select_own
  ON public.bonus_allocations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ----------------------------------------------------------
-- 5. allocate_first_n_bonus
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.allocate_first_n_bonus(
  _campaign_id  uuid,
  _user_id      uuid,
  _payment_id   uuid,
  _bonus_type   text,
  _course_id    uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _campaign    record;
  _position    integer;
BEGIN
  -- Busca campanha com lock para evitar race condition
  SELECT
    id,
    slug,
    is_active,
    starts_at,
    ends_at,
    bonus_type,
    bonus_target,
    max_allocations,
    allocated_count
  INTO _campaign
  FROM public.bonus_campaigns
  WHERE id = _campaign_id
  FOR UPDATE;

  -- Campanhas não existe
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'granted',    false,
      'position',   NULL,
      'campaign_id', _campaign_id,
      'course_id',  _course_id
    );
  END IF;

  -- Inativa
  IF NOT _campaign.is_active THEN
    RETURN jsonb_build_object(
      'granted',    false,
      'position',   NULL,
      'campaign_id', _campaign_id,
      'course_id',  _course_id
    );
  END IF;

  -- Ainda não começou
  IF _campaign.starts_at > now() THEN
    RETURN jsonb_build_object(
      'granted',    false,
      'position',   NULL,
      'campaign_id', _campaign_id,
      'course_id',  _course_id
    );
  END IF;

  -- Já encerrou
  IF _campaign.ends_at IS NOT NULL AND _campaign.ends_at <= now() THEN
    RETURN jsonb_build_object(
      'granted',    false,
      'position',   NULL,
      'campaign_id', _campaign_id,
      'course_id',  _course_id
    );
  END IF;

  -- Sem vagas
  IF _campaign.allocated_count >= _campaign.max_allocations THEN
    RETURN jsonb_build_object(
      'granted',    false,
      'position',   NULL,
      'campaign_id', _campaign_id,
      'course_id',  _course_id
    );
  END IF;

  -- bonus_type divergente
  IF _campaign.bonus_type IS DISTINCT FROM _bonus_type THEN
    RETURN jsonb_build_object(
      'granted',    false,
      'position',   NULL,
      'campaign_id', _campaign_id,
      'course_id',  _course_id
    );
  END IF;

  -- course_id divergente
  IF _campaign.bonus_target IS DISTINCT FROM _course_id THEN
    RETURN jsonb_build_object(
      'granted',    false,
      'position',   NULL,
      'campaign_id', _campaign_id,
      'course_id',  _course_id
    );
  END IF;

  -- Calcula posição antes de inserir
  _position := _campaign.allocated_count + 1;

  -- Inserção (pode falhar com unique_violation em race)
  BEGIN
    INSERT INTO public.bonus_allocations
      (campaign_id, payment_id, user_id, course_id, bonus_type, position, status)
    VALUES
      (_campaign_id, _payment_id, _user_id, _course_id, _bonus_type, _position, 'granted');
  EXCEPTION WHEN unique_violation THEN
    -- payment_id ou user_id duplicado nesta campanha
    RETURN jsonb_build_object(
      'granted',    false,
      'position',   NULL,
      'campaign_id', _campaign_id,
      'course_id',  _course_id
    );
  END;

  -- Incrementa contador
  UPDATE public.bonus_campaigns
  SET allocated_count = allocated_count + 1
  WHERE id = _campaign_id;

  RETURN jsonb_build_object(
    'granted',    true,
    'position',   _position,
    'campaign_id', _campaign_id,
    'course_id',  _course_id
  );
END;
$$;

-- ----------------------------------------------------------
-- 6. Permissões da função
-- ----------------------------------------------------------
REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)
  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)
  FROM anon;
REVOKE ALL ON FUNCTION public.allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)
  FROM authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)
  TO service_role;

-- ----------------------------------------------------------
-- 7. Trigger de updated_at para bonus_campaigns
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_bonus_campaigns_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bonus_campaigns_updated_at
  BEFORE UPDATE ON public.bonus_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_bonus_campaigns_updated_at();

-- ----------------------------------------------------------
-- 8. Validação final (tudo-em-um DO$$ — único bloco procedural)
-- ----------------------------------------------------------
DO $$
DECLARE
  _ok boolean := true;
  _msg text   := '';
BEGIN
  -- Tabelas existem
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'bonus_campaigns'
  ) THEN
    _ok := false; _msg := _msg || 'bonus_campaigns missing; ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'bonus_allocations'
  ) THEN
    _ok := false; _msg := _msg || 'bonus_allocations missing; ';
  END IF;

  -- RLS ativa
  IF _ok THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename  = 'bonus_campaigns'
        AND rowsecurity = true
    ) THEN
      _ok := false; _msg := _msg || 'RLS not enabled on bonus_campaigns; ';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename  = 'bonus_allocations'
        AND rowsecurity = true
    ) THEN
      _ok := false; _msg := _msg || 'RLS not enabled on bonus_allocations; ';
    END IF;
  END IF;

  -- Função existe com assinatura correta
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'allocate_first_n_bonus'
      AND p.proargtypes::text = 'uuid uuid uuid text uuid'
      AND p.prorettype = (
        SELECT oid FROM pg_type WHERE typname = 'jsonb'
      )
  ) THEN
    _ok := false; _msg := _msg || 'allocate_first_n_bonus missing or wrong sig; ';
  END IF;

  -- SECURITY DEFINER
  IF _ok THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'allocate_first_n_bonus'
        AND p.prosecdef = true
    ) THEN
      _ok := false; _msg := _msg || 'allocate_first_n_bonus not SECURITY DEFINER; ';
    END IF;
  END IF;

  -- anon/authenticated sem EXECUTE, service_role com EXECUTE
  IF _ok THEN
    -- anon: sem EXECUTE
    IF EXISTS (
      SELECT 1 FROM information_schema.routine_privileges
      WHERE routine_schema = 'public'
        AND specific_name  = 'allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)'
        AND privilege_type  = 'EXECUTE'
        AND grantee         = 'anon'
    ) THEN
      _ok := false; _msg := _msg || 'EXECUTE still granted to anon; ';
    END IF;

    -- authenticated: sem EXECUTE
    IF EXISTS (
      SELECT 1 FROM information_schema.routine_privileges
      WHERE routine_schema = 'public'
        AND specific_name  = 'allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)'
        AND privilege_type  = 'EXECUTE'
        AND grantee         = 'authenticated'
    ) THEN
      _ok := false; _msg := _msg || 'EXECUTE still granted to authenticated; ';
    END IF;

    -- service_role: com EXECUTE
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.routine_privileges
      WHERE routine_schema = 'public'
        AND specific_name  = 'allocate_first_n_bonus(uuid,uuid,uuid,text,uuid)'
        AND privilege_type  = 'EXECUTE'
        AND grantee         = 'service_role'
    ) THEN
      _ok := false; _msg := _msg || 'EXECUTE not granted to service_role; ';
    END IF;
  END IF;

  -- Resultado
  IF _ok THEN
    RAISE NOTICE 'VALIDATION OK: all bonus infrastructure objects created correctly.';
  ELSE
    RAISE EXCEPTION 'VALIDATION FAILED: %', _msg;
  END IF;
END;
$$;

COMMIT;
