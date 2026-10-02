-- ============================================================
-- DIAGNÓSTICO: 'Curso indisponível' no checkout Google AI Pro
-- SOMENTE LEITURA — nenhum UPDATE, DELETE, INSERT, DROP, ALTER
-- ============================================================

-- ============================================================
-- BLOCO 1: Busca por ID (UUID que a landing envia ao checkout)
--   Constante da landing: const GOOGLE_AI_PRO_COURSE_ID = "18ddfd2c-4a9b-4e6f-b9f0-6c3e8a1d2b4f";
-- ============================================================
DO $$
DECLARE
  r_id          UUID       := '18ddfd2c-4a9b-4e6f-b9f0-6c3e8a1d2b4f';
  found_id      UUID;
  found_slug    TEXT;
  found_title   TEXT;
  found_price   NUMERIC;
  found_pub     BOOLEAN;
BEGIN
  RAISE NOTICE '--- BLOCO 1: SELECT POR ID ---';
  SELECT id, slug, title, price, is_published
    INTO found_id, found_slug, found_title, found_price, found_pub
    FROM public.courses
    WHERE id = r_id;

  IF found_id IS NULL THEN
    RAISE NOTICE 'RESULTADO: NENHUM curso encontrado com id = %', r_id;
  ELSE
    RAISE NOTICE 'RESULTADO: id=%, slug=%, title=%, price=%, is_published=%',
      found_id, found_slug, found_title, found_price, found_pub;
  END IF;
END $$;

-- ============================================================
-- BLOCO 2: Busca por SLUG
-- ============================================================
DO $$
DECLARE
  found_id      UUID;
  found_slug    TEXT;
  found_title   TEXT;
  found_price   NUMERIC;
  found_pub     BOOLEAN;
BEGIN
  RAISE NOTICE '--- BLOCO 2: SELECT POR SLUG ---';
  SELECT id, slug, title, price, is_published
    INTO found_id, found_slug, found_title, found_price, found_pub
    FROM public.courses
    WHERE slug = 'google-ai-pro';

  IF found_id IS NULL THEN
    RAISE NOTICE 'RESULTADO: NENHUM curso encontrado com slug = google-ai-pro';
  ELSE
    RAISE NOTICE 'RESULTADO: id=%, slug=%, title=%, price=%, is_published=%',
      found_id, found_slug, found_title, found_price, found_pub;
  END IF;
END $$;

-- ============================================================
-- BLOCO 3: Verifica RLS em public.courses
-- ============================================================
DO $$
DECLARE
  rls_enabled   BOOLEAN;
  pol_name      TEXT;
  pol_cmd       TEXT;
  pol_qual      TEXT;
  pol_roles     TEXT;
  count_rows    BIGINT;
BEGIN
  RAISE NOTICE '--- BLOCO 3: RLS EM public.courses ---';

  SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'courses' AND relnamespace = 'public'::regnamespace;
  RAISE NOTICE 'RLS habilitado: %', rls_enabled;

  FOR pol_name, pol_cmd, pol_qual, pol_roles IN
    SELECT p.polname,
           p.polcmd::TEXT,
           pg_get_expr(p.polqual, p.polrelid, true),
           pg_catalog.pg_roles.rolname
      FROM pg_policy p
      JOIN pg_class c ON c.oid = p.polrelid
      JOIN pg_namespace ns ON ns.oid = c.relnamespace
      JOIN pg_catalog.pg_roles ON pg_catalog.pg_roles.oid = p.polroles[1]
     WHERE c.relname = 'courses'
       AND ns.nspname = 'public'
       AND p.polcmd <> 'DELETE'
  LOOP
    RAISE NOTICE '  Policy: name=%, cmd=%, qual=%, role=%',
      pol_name, pol_cmd, pol_qual, pol_roles;
  END LOOP;

  SELECT COUNT(*) INTO count_rows FROM public.courses;
  RAISE NOTICE 'Total de cursos no banco: %', count_rows;
END $$;

-- ============================================================
-- BLOCO 4: Simula SELECT com anon (contexto do createPixCharge)
--   O server-fn usa context.supabase que pode usar anon ou auth
-- ============================================================
DO $$
DECLARE
  found_id      UUID;
  found_slug    TEXT;
  found_pub     BOOLEAN;
  found_price   NUMERIC;
BEGIN
  RAISE NOTICE '--- BLOCO 4: SIMULACAO ANON ---';
  BEGIN
    SELECT id, slug, is_published, price
      INTO found_id, found_slug, found_pub, found_price
      FROM public.courses
      WHERE slug = 'google-ai-pro';

    RAISE NOTICE 'ANON RESULTADO: id=%, slug=%, is_published=%, price=%',
      found_id, found_slug, found_pub, found_price;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ANON ERRO: %', SQLERRM;
  END;
END $$;

-- ============================================================
-- BLOCO 5: Verifica is_published=false vs preco
-- ============================================================
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '--- BLOCO 5: TODOS OS CURSOS PUBLICADOS E SEUS PRECOS ---';
  FOR rec IN
    SELECT id, slug, title, price, is_published
      FROM public.courses
     ORDER BY slug
  LOOP
    RAISE NOTICE '  id=%, slug=%, price=%, is_published=%',
      rec.id, rec.slug, rec.price, rec.is_published;
  END LOOP;
END $$;
