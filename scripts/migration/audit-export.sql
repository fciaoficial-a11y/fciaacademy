-- FCIA Academy — Pacote de auditoria e exportação estrutural
-- Banco de ORIGEM (Lovable Cloud). Somente leitura.
-- Uso: psql -f scripts/migration/audit-export.sql > /mnt/documents/fcia-migration/audit.txt
-- Ou copie/cole bloco por bloco. Ordem: public primeiro, demais schemas depois.

\pset pager off
\timing off

-- =====================================================================
-- 1) SCHEMAS, TABELAS E VIEWS
-- =====================================================================

-- 1.1 schemas existentes (exclui internos do Postgres)
SELECT nspname AS schema
FROM pg_namespace
WHERE nspname NOT LIKE 'pg_%' AND nspname <> 'information_schema'
ORDER BY 1;

-- 1.2 tabelas do public + RLS + contagem estimada
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced,
       c.reltuples::bigint AS approx_rows
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;

-- 1.3 tabelas dos demais schemas de aplicação
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname IN ('storage','auth','realtime','vault','supabase_migrations')
ORDER BY 1,2;

-- 1.4 views e materialized views
SELECT n.nspname AS schema, c.relname AS view_name,
       CASE c.relkind WHEN 'v' THEN 'view' WHEN 'm' THEN 'matview' END AS kind,
       pg_get_viewdef(c.oid, true) AS definition
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('v','m')
  AND n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
ORDER BY 1,2;

-- 1.5 contagem REAL de linhas por tabela do public (para verify de carga)
SELECT relname AS table_name,
       (xpath('/row/c/text()',
              query_to_xml(format('SELECT count(*) AS c FROM public.%I', relname),
                           false, true, '')))[1]::text::bigint AS exact_rows
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;

-- =====================================================================
-- 2) COLUNAS
-- =====================================================================

-- 2.1 colunas do public com tipo, nulabilidade e default
SELECT table_name, ordinal_position AS pos, column_name,
       data_type,
       COALESCE(character_maximum_length::text, numeric_precision::text, '-') AS len,
       is_nullable,
       COALESCE(column_default, '-') AS default_expr,
       is_identity, identity_generation
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2.2 colunas geradas / identity (precisam de tratamento na carga CSV)
SELECT table_name, column_name, generation_expression
FROM information_schema.columns
WHERE table_schema = 'public' AND is_generated = 'ALWAYS';

-- 2.3 comentários de coluna e tabela
SELECT c.relname AS object, a.attname AS column_name, d.description
FROM pg_description d
JOIN pg_class c ON c.oid = d.objoid
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
WHERE n.nspname = 'public'
ORDER BY 1,2;

-- =====================================================================
-- 3) CONSTRAINTS, FKs E ÍNDICES
-- =====================================================================

-- 3.1 todas as constraints do public em DDL pronto (p=PK, u=UNIQUE, f=FK, c=CHECK)
SELECT n.nspname AS schema, t.relname AS table_name, con.conname AS constraint_name,
       con.contype, pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class t ON t.oid = con.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
ORDER BY t.relname, con.contype, con.conname;

-- 3.2 FKs com ação de delete/update (ordem de carga depende disso)
SELECT tc.table_name AS child_table, kcu.column_name AS child_column,
       ccu.table_schema AS parent_schema, ccu.table_name AS parent_table,
       ccu.column_name AS parent_column,
       rc.delete_rule, rc.update_rule, tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tc.constraint_name AND kcu.constraint_schema = tc.constraint_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.constraint_schema = tc.constraint_schema
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY 1,2;

-- 3.3 ordem topológica de carga sugerida (tabelas sem FK primeiro)
SELECT t.relname AS table_name,
       COUNT(con.oid) FILTER (WHERE con.contype = 'f') AS fk_count
FROM pg_class t
JOIN pg_namespace n ON n.oid = t.relnamespace
LEFT JOIN pg_constraint con ON con.conrelid = t.oid
WHERE n.nspname = 'public' AND t.relkind = 'r'
GROUP BY t.relname
ORDER BY fk_count, table_name;

-- 3.4 índices em DDL pronto (exclui os criados por constraint)
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================================
-- 4) POLICIES RLS
-- =====================================================================

-- 4.1 policies do public em forma legível
SELECT schemaname, tablename, policyname, permissive, roles, cmd,
       COALESCE(qual, '-') AS using_expr,
       COALESCE(with_check, '-') AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 4.2 policies de storage.objects e storage.buckets
SELECT schemaname, tablename, policyname, roles, cmd,
       COALESCE(qual,'-') AS using_expr, COALESCE(with_check,'-') AS check_expr
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, cmd, policyname;

-- 4.3 gera CREATE POLICY pronto para o destino (public + storage)
SELECT format(
  'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s;',
  policyname, schemaname, tablename,
  CASE WHEN permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
  cmd, array_to_string(roles, ', '),
  CASE WHEN qual IS NULL THEN '' ELSE ' USING (' || qual || ')' END,
  CASE WHEN with_check IS NULL THEN '' ELSE ' WITH CHECK (' || with_check || ')' END
) AS ddl
FROM pg_policies
WHERE schemaname IN ('public','storage')
ORDER BY schemaname, tablename, policyname;

-- 4.4 tabelas do public SEM RLS (deve retornar zero linhas)
SELECT c.relname
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity IS FALSE;

-- =====================================================================
-- 5) FUNCTIONS
-- =====================================================================

-- 5.1 DDL completo de todas as funções do public (reconstrução direta)
SELECT p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS args,
       p.prosecdef AS security_definer,
       p.provolatile AS volatility,
       COALESCE(array_to_string(p.proconfig, ', '), '-') AS config,
       pg_get_functiondef(p.oid) AS ddl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prokind = 'f'
ORDER BY p.proname;

-- 5.2 auditoria: SECURITY DEFINER sem search_path fixo (risco de segurança)
SELECT p.proname, COALESCE(array_to_string(p.proconfig, ', '), 'SEM search_path') AS config
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef
  AND (p.proconfig IS NULL OR NOT EXISTS (
        SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%'))
ORDER BY 1;

-- 5.3 privilégios de execução por função
SELECT p.proname, COALESCE(p.proacl::text, 'default (PUBLIC EXECUTE)') AS acl
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prokind = 'f'
ORDER BY 1;

-- =====================================================================
-- 6) TRIGGERS
-- =====================================================================

-- 6.1 triggers do public em DDL pronto (exclui triggers internos de FK)
SELECT n.nspname AS schema, c.relname AS table_name, t.tgname AS trigger_name,
       t.tgenabled AS enabled_flag,   -- O=ativo, D=desabilitado
       pg_get_triggerdef(t.oid, true) AS ddl
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal AND n.nspname = 'public'
ORDER BY c.relname, t.tgname;

-- 6.2 triggers em auth.users (críticos: profiles/role/plano no signup)
-- Requer permissão de leitura no schema auth; se falhar, conferir no painel.
SELECT c.relname AS table_name, t.tgname, t.tgenabled,
       pg_get_triggerdef(t.oid, true) AS ddl
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal AND n.nspname = 'auth'
ORDER BY 1,2;

-- 6.3 detector de trigger duplicado (mesma tabela + mesma função)
SELECT c.relname AS table_name, p.proname AS function_name,
       COUNT(*) AS trigger_count, array_agg(t.tgname ORDER BY t.tgname) AS triggers
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE NOT t.tgisinternal AND n.nspname = 'public'
GROUP BY 1,2
HAVING COUNT(*) > 1;

-- =====================================================================
-- 7) ENUMS E TIPOS CUSTOMIZADOS
-- =====================================================================

-- 7.1 enums com valores na ordem correta
SELECT n.nspname AS schema, t.typname AS enum_name,
       string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) AS values
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname NOT LIKE 'pg_%'
GROUP BY 1,2
ORDER BY 1,2;

-- 7.2 CREATE TYPE pronto para o destino
SELECT format('CREATE TYPE %I.%I AS ENUM (%s);', schema_name, enum_name, vals) AS ddl
FROM (
  SELECT n.nspname AS schema_name, t.typname AS enum_name,
         string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) AS vals
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
  GROUP BY 1, 2
) s;

-- 7.3 domains e composite types (se houver)
SELECT n.nspname, t.typname, t.typtype
FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public' AND t.typtype IN ('d','c')
  AND NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.oid = t.typrelid AND c.relkind <> 'c');

-- 7.4 extensões instaladas (recriar ANTES de tudo no destino)
SELECT e.extname, n.nspname AS schema, e.extversion
FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace
ORDER BY 1;

-- =====================================================================
-- 8) GRANTS
-- =====================================================================

-- 8.1 ACL bruta por tabela do public
SELECT c.relname AS table_name, COALESCE(c.relacl::text, 'sem ACL explícita') AS acl
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;

-- 8.2 grants normalizados por role de API
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon','authenticated','service_role','postgres','PUBLIC')
GROUP BY 1,2
ORDER BY 1,2;

-- 8.3 gera GRANT pronto para o destino
SELECT format('GRANT %s ON public.%I TO %I;',
              string_agg(DISTINCT privilege_type, ', '), table_name, grantee) AS ddl
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon','authenticated','service_role')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- 8.4 grants de schema e default privileges
SELECT nspname, COALESCE(nspacl::text,'-') AS schema_acl
FROM pg_namespace WHERE nspname IN ('public','storage');

SELECT n.nspname AS schema, d.defaclobjtype AS obj_type, d.defaclacl::text AS default_acl
FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace;

-- 8.5 sequences (grant separado do da tabela)
SELECT c.relname AS sequence_name, COALESCE(c.relacl::text,'-') AS acl
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'S';

-- =====================================================================
-- 9) BUCKETS E METADADOS DE STORAGE
-- =====================================================================

-- 9.1 buckets com limites e mime types permitidos
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
FROM storage.buckets
ORDER BY name;

-- 9.2 resumo por bucket: nº de objetos e tamanho total
SELECT b.name AS bucket,
       COUNT(o.id) AS objects,
       pg_size_pretty(COALESCE(SUM((o.metadata->>'size')::bigint), 0)) AS total_size
FROM storage.buckets b
LEFT JOIN storage.objects o ON o.bucket_id = b.id
GROUP BY b.name
ORDER BY b.name;

-- 9.3 inventário de objetos (path exato deve ser preservado no destino)
SELECT o.bucket_id, o.name AS path,
       (o.metadata->>'size')::bigint AS size_bytes,
       o.metadata->>'mimetype' AS mimetype,
       o.created_at, o.updated_at
FROM storage.objects o
ORDER BY o.bucket_id, o.name;

-- 9.4 paths de storage referenciados pelo banco (devem existir no destino)
SELECT 'modules.pdf_path' AS source, pdf_path AS path FROM public.modules WHERE pdf_path IS NOT NULL
UNION ALL
SELECT 'modules.intro_video_path', intro_video_path FROM public.modules WHERE intro_video_path IS NOT NULL
UNION ALL
SELECT 'modules.intro_video_poster_path', intro_video_poster_path FROM public.modules WHERE intro_video_poster_path IS NOT NULL
UNION ALL
SELECT 'course_bonuses.pdf_path', pdf_path FROM public.course_bonuses WHERE pdf_path IS NOT NULL
UNION ALL
SELECT 'courses.full_pdf_path', full_pdf_path FROM public.courses WHERE full_pdf_path IS NOT NULL
ORDER BY 1,2;

-- 9.5 objetos órfãos: existem no storage mas ninguém referencia
WITH referenced AS (
  SELECT pdf_path AS path FROM public.modules WHERE pdf_path IS NOT NULL
  UNION SELECT intro_video_path FROM public.modules WHERE intro_video_path IS NOT NULL
  UNION SELECT intro_video_poster_path FROM public.modules WHERE intro_video_poster_path IS NOT NULL
  UNION SELECT pdf_path FROM public.course_bonuses WHERE pdf_path IS NOT NULL
  UNION SELECT full_pdf_path FROM public.courses WHERE full_pdf_path IS NOT NULL
)
SELECT o.bucket_id, o.name AS orphan_path
FROM storage.objects o
WHERE o.name NOT IN (SELECT path FROM referenced)
ORDER BY 1,2;

-- =====================================================================
-- 10) FECHAMENTO — usar como assinatura do inventário
-- =====================================================================
SELECT
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname='public') AS tables,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public') AS indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname='public') AS policies_public,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname='storage') AS policies_storage,
  (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public') AS functions,
  (SELECT COUNT(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
     JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE NOT t.tgisinternal AND n.nspname='public') AS triggers,
  (SELECT COUNT(*) FROM storage.buckets) AS buckets,
  (SELECT COUNT(*) FROM storage.objects) AS storage_objects,
  now() AS captured_at;
