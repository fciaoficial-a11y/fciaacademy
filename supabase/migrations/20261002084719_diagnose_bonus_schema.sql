-- Diagnóstico somente-leitura do schema de bônus
-- Não executa nenhuma escrita no banco
DO $$
DECLARE
  tbl_exists boolean;
  alloc_exists boolean;
  alloc_fn_exists boolean;
  bonus_fn_exists boolean;
  diag_text text := '';
  r record;
  fn_rec record;
  camp_rec record;
  course_rec record;
  col_list text;
BEGIN
  -- A) Tabelas bonus_campaigns e bonus_allocations
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bonus_campaigns'
  ) INTO tbl_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'bonus_allocations'
  ) INTO alloc_exists;

  diag_text := diag_text || 'bonus_campaigns: ' || CASE WHEN tbl_exists THEN 'EXISTE' ELSE 'NAO EXISTE' END || E'\n';
  diag_text := diag_text || 'bonus_allocations: ' || CASE WHEN alloc_exists THEN 'EXISTE' ELSE 'NAO EXISTE' END || E'\n\n';

  -- B) Colunas de bonus_campaigns
  IF tbl_exists THEN
    diag_text := diag_text || 'bonus_campaigns colunas:' || E'\n';
    col_list := '';
    FOR r IN
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'bonus_campaigns'
      ORDER BY ordinal_position
    LOOP
      col_list := col_list || '  ' || r.column_name || ':' || r.data_type || ':' || r.is_nullable || E'\n';
    END LOOP;
    diag_text := diag_text || col_list || E'\n';
  END IF;

  -- B) Colunas de bonus_allocations
  IF alloc_exists THEN
    diag_text := diag_text || 'bonus_allocations colunas:' || E'\n';
    col_list := '';
    FOR r IN
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'bonus_allocations'
      ORDER BY ordinal_position
    LOOP
      col_list := col_list || '  ' || r.column_name || ':' || r.data_type || ':' || r.is_nullable || E'\n';
    END LOOP;
    diag_text := diag_text || col_list || E'\n';
  END IF;

  -- C) Funções allocate_first_n_bonus e allocate_bonus_course
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'allocate_first_n_bonus'
  ) INTO alloc_fn_exists;

  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'allocate_bonus_course'
  ) INTO bonus_fn_exists;

  diag_text := diag_text || 'allocate_first_n_bonus: ' || CASE WHEN alloc_fn_exists THEN 'EXISTE' ELSE 'NAO EXISTE' END || E'\n';
  diag_text := diag_text || 'allocate_bonus_course: ' || CASE WHEN bonus_fn_exists THEN 'EXISTE' ELSE 'NAO EXISTE' END || E'\n\n';

  IF alloc_fn_exists THEN
    FOR fn_rec IN
      SELECT p.proname,
             pg_get_function_arguments(p.oid) AS args,
             pg_get_function_return_type(p.oid) AS ret_type,
             CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS sec_def
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'allocate_first_n_bonus'
    LOOP
      diag_text := diag_text || '  allocate_first_n_bonus(' || fn_rec.args || ') -> ' || fn_rec.ret_type || ' [' || fn_rec.sec_def || ']' || E'\n';
    END LOOP;
  END IF;

  IF bonus_fn_exists THEN
    FOR fn_rec IN
      SELECT p.proname,
             pg_get_function_arguments(p.oid) AS args,
             pg_get_function_return_type(p.oid) AS ret_type,
             CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS sec_def
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'allocate_bonus_course'
    LOOP
      diag_text := diag_text || '  allocate_bonus_course(' || fn_rec.args || ') -> ' || fn_rec.ret_type || ' [' || fn_rec.sec_def || ']' || E'\n';
    END LOOP;
  END IF;

  diag_text := diag_text || E'\n';

  -- D) Campanhas
  IF tbl_exists THEN
    diag_text := diag_text || 'Campanhas:' || E'\n';

    FOR camp_rec IN
      SELECT id, slug FROM public.bonus_campaigns
      WHERE slug IN ('google-ai-pro-10-first', 'google-ai-pro-launch')
    LOOP
      diag_text := diag_text || '  slug=' || camp_rec.slug || ' id=' || camp_rec.id || E'\n';
    END LOOP;

    IF NOT FOUND THEN
      diag_text := diag_text || '  Nenhuma campanha encontrada para google-ai-pro-10-first ou google-ai-pro-launch' || E'\n';
    END IF;
  ELSE
    diag_text := diag_text || 'Campanhas: TABELA NAO EXISTE - consulta ignorada' || E'\n';
  END IF;

  diag_text := diag_text || E'\n';

  -- E) Cursos
  diag_text := diag_text || 'Cursos:' || E'\n';

  FOR course_rec IN
    SELECT id, slug, title, price, is_published
    FROM public.courses
    WHERE slug IN ('google-ai-pro', 'metodo-ia-criativa')
    ORDER BY slug
  LOOP
    diag_text := diag_text || '  slug=' || course_rec.slug
      || ' id=' || course_rec.id
      || ' is_published=' || course_rec.is_published
      || ' price=' || COALESCE(course_rec.price::text, 'NULL')
      || E'\n';
  END LOOP;

  IF NOT FOUND THEN
    diag_text := diag_text || '  Nenhum curso encontrado para google-ai-pro ou metodo-ia-criativa' || E'\n';
  END IF;

  RAISE EXCEPTION 'DIAGNOSTICO: %', diag_text;
END $$;
