-- Diagnostic only migration: reads pg_catalog and information_schema, raises results, makes no persistent changes.
-- This migration MUST fail intentionally to display the diagnostic via RAISE EXCEPTION.

DO $$
DECLARE
  bc_exists BOOLEAN;
  ba_exists BOOLEAN;
  fn_allocate_first_n BOOLEAN := FALSE;
  fn_allocate_bonus_course BOOLEAN := FALSE;
  camp_exists BOOLEAN;
  camp_launch_exists BOOLEAN;
  gaip_exists BOOLEAN;
  mic_exists BOOLEAN;

  gaip_uuid UUID;
  gaip_slug TEXT;
  gaip_published BOOLEAN;
  gaip_price NUMERIC;

  mic_uuid UUID;
  mic_slug TEXT;
  mic_published BOOLEAN;
  mic_price NUMERIC;

  camp_uuid UUID;
  camp_slug TEXT;
  camp_allocated INTEGER;
  camp_max INTEGER;
  camp_active BOOLEAN;

  camp_launch_uuid UUID;
  camp_launch_slug TEXT;

  diag TEXT := '';

  col RECORD;
  param RECORD;
  m RECORD;

  -- fn signature
  fn_name TEXT;
  fn_args TEXT;
  fn_ret TEXT;
  fn_sec TEXT;

  -- Migration history entries
  m1_exists BOOLEAN;
  m2_exists BOOLEAN;
  m3_exists BOOLEAN;
  m4_exists BOOLEAN;
  m5_exists BOOLEAN;

  m1_hash TEXT;
  m2_hash TEXT;
  m3_hash TEXT;
  m4_hash TEXT;
  m5_hash TEXT;

  m1_applied_at TIMESTAMPTZ;
  m2_applied_at TIMESTAMPTZ;
  m3_applied_at TIMESTAMPTZ;
  m4_applied_at TIMESTAMPTZ;
  m5_applied_at TIMESTAMPTZ;

  m1_name TEXT;
  m2_name TEXT;
  m3_name TEXT;
  m4_name TEXT;
  m5_name TEXT;
BEGIN

  -- === 1. bonus_campaigns existence ===
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bonus_campaigns'
  ) INTO bc_exists;

  diag := diag || '=== bonus_campaigns ===' || E'\n';
  diag := diag || 'exists: ' || bc_exists || E'\n';

  IF bc_exists THEN
    FOR col IN
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'bonus_campaigns'
      ORDER BY ordinal_position
    LOOP
      diag := diag || '  ' || col.column_name || ' | ' || col.data_type || ' | nullable: ' || col.is_nullable || E'\n';
    END LOOP;
  END IF;

  -- === 2. bonus_allocations existence ===
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bonus_allocations'
  ) INTO ba_exists;

  diag := diag || E'\n=== bonus_allocations ===' || E'\n';
  diag := diag || 'exists: ' || ba_exists || E'\n';

  IF ba_exists THEN
    FOR col IN
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'bonus_allocations'
      ORDER BY ordinal_position
    LOOP
      diag := diag || '  ' || col.column_name || ' | ' || col.data_type || ' | nullable: ' || col.is_nullable || E'\n';
    END LOOP;
  END IF;

  -- === 3. allocate_first_n_bonus ===
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'allocate_first_n_bonus'
  ) INTO fn_allocate_first_n;

  diag := diag || E'\n=== allocate_first_n_bonus ===' || E'\n';
  diag := diag || 'exists: ' || fn_allocate_first_n || E'\n';

  IF fn_allocate_first_n THEN
    SELECT p.proname, pg_get_function_arguments(p.oid), pg_get_function_return_type(p.oid),
           CASE WHEN p.proisdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END
    INTO fn_name, fn_args, fn_ret, fn_sec
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'allocate_first_n_bonus'
    LIMIT 1;
    diag := diag || '  name: ' || fn_name || E'\n';
    diag := diag || '  args: ' || COALESCE(fn_args, '(none)') || E'\n';
    diag := diag || '  returns: ' || COALESCE(fn_ret, 'void') || E'\n';
    diag := diag || '  security: ' || fn_sec || E'\n';

    FOR param IN
      SELECT param_name, data_type, parameter_mode
      FROM information_schema.parameters
      WHERE specific_schema = 'public'
        AND specific_name = (SELECT routine_name || '_' || routine_schema FROM information_schema.routines WHERE routine_name = 'allocate_first_n_bonus' AND routine_schema = 'public' LIMIT 1)
      ORDER BY ordinal_position
    LOOP
      diag := diag || '  param: ' || COALESCE(param.parameter_mode, 'IN') || ' ' || COALESCE(param.param_name, 'unnamed') || ' ' || param.data_type || E'\n';
    END LOOP;
  END IF;

  -- === 4. allocate_bonus_course ===
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'allocate_bonus_course'
  ) INTO fn_allocate_bonus_course;

  diag := diag || E'\n=== allocate_bonus_course ===' || E'\n';
  diag := diag || 'exists: ' || fn_allocate_bonus_course || E'\n';

  IF fn_allocate_bonus_course THEN
    SELECT p.proname, pg_get_function_arguments(p.oid), pg_get_function_return_type(p.oid),
           CASE WHEN p.proisdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END
    INTO fn_name, fn_args, fn_ret, fn_sec
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'allocate_bonus_course'
    LIMIT 1;
    diag := diag || '  name: ' || fn_name || E'\n';
    diag := diag || '  args: ' || COALESCE(fn_args, '(none)') || E'\n';
    diag := diag || '  returns: ' || COALESCE(fn_ret, 'void') || E'\n';
    diag := diag || '  security: ' || fn_sec || E'\n';
  END IF;

  -- === 5. Campanhas ===
  IF bc_exists THEN
    SELECT EXISTS (SELECT 1 FROM public.bonus_campaigns WHERE slug = 'google-ai-pro-10-first')
    INTO camp_exists;

    IF camp_exists THEN
      SELECT id, slug, allocated_count, max_allocations, is_active
      INTO camp_uuid, camp_slug, camp_allocated, camp_max, camp_active
      FROM public.bonus_campaigns WHERE slug = 'google-ai-pro-10-first';
    END IF;

    SELECT EXISTS (SELECT 1 FROM public.bonus_campaigns WHERE slug = 'google-ai-pro-launch')
    INTO camp_launch_exists;

    IF camp_launch_exists THEN
      SELECT id, slug INTO camp_launch_uuid, camp_launch_slug
      FROM public.bonus_campaigns WHERE slug = 'google-ai-pro-launch';
    END IF;
  ELSE
    camp_exists := FALSE;
    camp_launch_exists := FALSE;
  END IF;

  diag := diag || E'\n=== campaigns ===' || E'\n';
  diag := diag || 'google-ai-pro-10-first exists: ' || camp_exists || E'\n';
  IF camp_exists THEN
    diag := diag || '  id: ' || camp_uuid || E'\n';
    diag := diag || '  slug: ' || camp_slug || E'\n';
    diag := diag || '  allocated_count: ' || camp_allocated || E'\n';
    diag := diag || '  max_allocations: ' || camp_max || E'\n';
    diag := diag || '  is_active: ' || camp_active || E'\n';
  END IF;
  diag := diag || 'google-ai-pro-launch exists: ' || camp_launch_exists || E'\n';
  IF camp_launch_exists THEN
    diag := diag || '  id: ' || camp_launch_uuid || E'\n';
    diag := diag || '  slug: ' || camp_launch_slug || E'\n';
  END IF;

  -- === 6. Cursos ===
  SELECT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'google-ai-pro'),
         EXISTS (SELECT 1 FROM public.courses WHERE slug = 'metodo-ia-criativa')
  INTO gaip_exists, mic_exists;

  diag := diag || E'\n=== courses ===' || E'\n';
  diag := diag || 'google-ai-pro exists: ' || gaip_exists || E'\n';
  IF gaip_exists THEN
    SELECT id, slug, is_published, price INTO gaip_uuid, gaip_slug, gaip_published, gaip_price
    FROM public.courses WHERE slug = 'google-ai-pro' LIMIT 1;
    diag := diag || '  id: ' || gaip_uuid || E'\n';
    diag := diag || '  slug: ' || gaip_slug || E'\n';
    diag := diag || '  is_published: ' || gaip_published || E'\n';
    diag := diag || '  price: ' || COALESCE(gaip_price::TEXT, 'NULL') || E'\n';
  END IF;

  diag := diag || 'metodo-ia-criativa exists: ' || mic_exists || E'\n';
  IF mic_exists THEN
    SELECT id, slug, is_published, price INTO mic_uuid, mic_slug, mic_published, mic_price
    FROM public.courses WHERE slug = 'metodo-ia-criativa' LIMIT 1;
    diag := diag || '  id: ' || mic_uuid || E'\n';
    diag := diag || '  slug: ' || mic_slug || E'\n';
    diag := diag || '  is_published: ' || mic_published || E'\n';
    diag := diag || '  price: ' || COALESCE(mic_price::TEXT, 'NULL') || E'\n';
  END IF;

  -- === 7. Migration history ===
  diag := diag || E'\n=== migration history ===' || E'\n';

  FOR m IN
    SELECT version, name, type, applied_at, execution_time, statement
    FROM supabase_migrations.schema_migrations
    WHERE version IN (
      '20261002033556','20261002063858','20261002070300','20261002083629','20261002084100'
    )
    ORDER BY version
  LOOP
    diag := diag || '  version: ' || m.version || E'\n';
    diag := diag || '  applied_at: ' || COALESCE(m.applied_at::TEXT, 'NULL') || E'\n';
    diag := diag || '  execution_time_ms: ' || COALESCE(m.execution_time::TEXT, 'NULL') || E'\n';
    diag := diag || '  name: ' || COALESCE(m.name, 'NULL') || E'\n';
  END LOOP;

  -- Raise to display diagnostic (migration intentionally fails)
  RAISE EXCEPTION 'DIAGNOSTIC_RESULT: %', diag;

END $$;
