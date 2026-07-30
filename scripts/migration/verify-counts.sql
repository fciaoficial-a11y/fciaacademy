-- FCIA Academy — validação pós-migração.
-- Rode no banco de ORIGEM e no de DESTINO e compare linha a linha.
--   psql -f scripts/migration/verify-counts.sql
--   psql "$TARGET_DB_URL" -f scripts/migration/verify-counts.sql

\echo '== Contagens por tabela =='
SELECT 'plans'                AS tabela, count(*) FROM public.plans
UNION ALL SELECT 'achievements',         count(*) FROM public.achievements
UNION ALL SELECT 'certificate_settings', count(*) FROM public.certificate_settings
UNION ALL SELECT 'tracks',               count(*) FROM public.tracks
UNION ALL SELECT 'courses',              count(*) FROM public.courses
UNION ALL SELECT 'modules',              count(*) FROM public.modules
UNION ALL SELECT 'questions',            count(*) FROM public.questions
UNION ALL SELECT 'course_bonuses',       count(*) FROM public.course_bonuses
UNION ALL SELECT 'profiles',             count(*) FROM public.profiles
UNION ALL SELECT 'user_roles',           count(*) FROM public.user_roles
UNION ALL SELECT 'subscriptions',        count(*) FROM public.subscriptions
UNION ALL SELECT 'enrollments',          count(*) FROM public.enrollments
UNION ALL SELECT 'module_progress',      count(*) FROM public.module_progress
UNION ALL SELECT 'quiz_attempts',        count(*) FROM public.quiz_attempts
UNION ALL SELECT 'certificates',         count(*) FROM public.certificates
UNION ALL SELECT 'xp_log',               count(*) FROM public.xp_log
UNION ALL SELECT 'user_achievements',    count(*) FROM public.user_achievements
UNION ALL SELECT 'bonus_downloads',      count(*) FROM public.bonus_downloads
UNION ALL SELECT 'gateway_events',       count(*) FROM public.gateway_events
ORDER BY 1;

\echo '== XP total por usuario (deve bater exatamente) =='
SELECT user_id, sum(amount) AS xp_total, count(*) AS eventos
FROM public.xp_log
GROUP BY user_id
ORDER BY user_id;

\echo '== XP do log x XP do profile (divergencia = trigger rodou na carga) =='
SELECT p.id,
       p.xp                                AS xp_profile,
       COALESCE(sum(x.amount), 0)          AS xp_log,
       p.xp - COALESCE(sum(x.amount), 0)   AS diferenca
FROM public.profiles p
LEFT JOIN public.xp_log x ON x.user_id = p.id
GROUP BY p.id, p.xp
ORDER BY abs(p.xp - COALESCE(sum(x.amount), 0)) DESC;

\echo '== RLS habilitada em todas as tabelas de public =='
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false
ORDER BY tablename;

\echo '== Tabelas de public sem GRANT para authenticated =='
SELECT t.tablename
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.role_table_grants g
    WHERE g.table_schema = 'public'
      AND g.table_name = t.tablename
      AND g.grantee = 'authenticated'
  )
ORDER BY 1;

\echo '== Funcoes SECURITY DEFINER (esperado: 24) =='
SELECT count(*) AS security_definer_functions
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef;

\echo '== Paths de storage referenciados pelo banco (todos devem existir no destino) =='
SELECT 'modules.pdf_path' AS origem, pdf_path AS path
FROM public.modules WHERE pdf_path IS NOT NULL
UNION ALL
SELECT 'modules.intro_video_path', intro_video_path
FROM public.modules WHERE intro_video_path IS NOT NULL
UNION ALL
SELECT 'modules.intro_video_poster_path', intro_video_poster_path
FROM public.modules WHERE intro_video_poster_path IS NOT NULL
UNION ALL
SELECT 'course_bonuses.pdf_path', pdf_path
FROM public.course_bonuses WHERE pdf_path IS NOT NULL
UNION ALL
SELECT 'courses.full_pdf_path', full_pdf_path
FROM public.courses WHERE full_pdf_path IS NOT NULL
ORDER BY 1, 2;
