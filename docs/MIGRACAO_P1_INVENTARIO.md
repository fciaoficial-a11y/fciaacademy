# FCIA Academy — Prompt 1: Inventário total do banco (Lovable Cloud)

Fonte: leitura direta do catálogo do banco em runtime (`ref pfaeoekeubkcneqogwho`), 31/07/2026.
Marcações: **FATO** = lido do banco · **NÃO VALIDADO** = sem permissão de leitura nesta sessão.

## Prioridade de migração

| # | Bloco | Objetos | Criticidade |
| --- | --- | --- | --- |
| 1 | Extensões + enum `app_role` | 4 extensões + 1 enum | Bloqueador |
| 2 | Tabelas `public` sem dependência | plans, tracks, achievements, certificate_settings, gateway_events | Bloqueador |
| 3 | Tabelas dependentes | courses → modules → questions/course_bonuses; profiles, user_roles, subscriptions, enrollments, module_progress, quiz_attempts, certificates, xp_log, user_achievements, bonus_downloads, payments | Bloqueador |
| 4 | 36 funções (30 SECURITY DEFINER) | `has_course_access`, `has_role`, `grant_paid_access`, `get_quiz_eligibility`, `assemble_exam`, `validate_certificate`, `admin_*` | Bloqueador |
| 5 | 19 triggers em `public` | XP, certificado, publish rules, updated_at | Bloqueador |
| 6 | 42 policies RLS (`public`) + 11 (`storage.objects`) | — | Bloqueador |
| 7 | GRANTs por tabela | anon/authenticated/service_role | Bloqueador |
| 8 | 4 buckets + 4 objetos | paths preservados | Alto |
| 9 | Auth (9 usuários) | senhas/identities | Alto |
| 10 | Webhook Asaas + redirects de auth | 1 rota pública | Alto |

## 1. Schemas (FATO)

| Schema | Observação |
| --- | --- |
| public | 20 tabelas — escopo da migração |
| auth | 16 tabelas — gerenciado pelo Supabase |
| storage | 2 tabelas (`buckets`, `objects`) |
| extensions | 2 views |
| graphql, graphql_public, realtime, vault, supabase_migrations | gerenciados pela plataforma |

## 2. Tabelas de `public` (FATO) — RLS ativa em 100%

| Tabela | Colunas | Linhas | Índices | Policies |
| --- | --- | --- | --- | --- |
| achievements | 8 | 5 | 2 | 1 |
| bonus_downloads | 4 | 2 | 3 | 2 |
| certificate_settings | 16 | 1 | 1 | 2 |
| certificates | 13 | 1 | 5 | 2 |
| course_bonuses | 13 | 4 | 3 | 2 |
| courses | 20 | 6 | 4 | 2 |
| enrollments | 9 | 4 | 4 | 4 |
| gateway_events | 6 | 9 | 2 | 1 |
| module_progress | 9 | 5 | 3 | 1 |
| modules | 24 | 35 | 3 | 2 |
| payments | 18 | 3 | 7 | 2 |
| plans | 8 | 6 | 1 | 2 |
| profiles | 14 | 9 | 1 | 5 |
| questions | 17 | 122 | 5 | 2 |
| quiz_attempts | 10 | 2 | 2 | 2 |
| subscriptions | 11 | 9 | 3 | 2 |
| tracks | 15 | 6 | 2 | 2 |
| user_achievements | 4 | 6 | 2 | 1 |
| user_roles | 4 | 9 | 2 | 2 |
| xp_log | 6 | 48 | 2 | 1 |

Total: 20 tabelas · 57 índices · 42 policies.

## 3. Colunas, tipos, nulabilidade, defaults

Dump completo gerado por `information_schema.columns` (233 linhas). Comando de reprodução:

```sql
SELECT table_name, ordinal_position, column_name, data_type, is_nullable,
       COALESCE(column_default,'-')
FROM information_schema.columns
WHERE table_schema='public'
ORDER BY table_name, ordinal_position;
```

Padrão observado (FATO): PK `uuid DEFAULT gen_random_uuid()`, timestamps
`timestamptz DEFAULT now()`, enums de domínio via CHECK em `text`.

## 4. Chaves primárias e estrangeiras (FATO)

PK em todas as 20 tabelas (`id`; exceção `plans.id text`, `certificate_settings.id integer`).

| Tabela filha | FK | Tabela pai | On delete |
| --- | --- | --- | --- |
| courses | track_id | tracks | CASCADE |
| modules | course_id | courses | CASCADE |
| questions | module_id, course_id | modules, courses | CASCADE |
| course_bonuses | course_id | courses | CASCADE |
| bonus_downloads | bonus_id, user_id | course_bonuses, auth.users | CASCADE |
| enrollments | user_id, course_id, track_id | auth.users, courses, tracks | CASCADE / CASCADE / SET NULL |
| module_progress | user_id, module_id, course_id | auth.users, modules, courses | CASCADE |
| quiz_attempts | user_id, module_id, course_id | auth.users, modules, courses | CASCADE |
| certificates | user_id, course_id | auth.users, courses | CASCADE |
| payments | user_id, course_id, plan_id | auth.users, courses, plans | CASCADE / SET NULL / — |
| subscriptions | user_id, plan_id | auth.users, plans | CASCADE / — |
| profiles | id | auth.users | CASCADE |
| user_roles | user_id | auth.users | CASCADE |
| user_achievements | user_id, achievement_id | auth.users, achievements | CASCADE |
| xp_log | user_id | auth.users | CASCADE |

UNIQUEs críticos (idempotência da carga): `courses.slug`, `tracks.slug`,
`modules(course_id,slug)`, `course_bonuses(course_id,slug)`,
`enrollments(user_id,course_id)`, `module_progress(user_id,module_id)`,
`certificates(user_id,course_id)`, `certificates.validation_code`,
`payments(provider,provider_payment_id)`, `gateway_events(provider,event_id)`,
`user_roles(user_id,role)`, `user_achievements(user_id,achievement_id)`,
`achievements.code`.

## 5. Enums (FATO)

| Tipo | Valores |
| --- | --- |
| public.app_role | admin, aluno |

## 6. Extensões (FATO)

| Extensão | Schema |
| --- | --- |
| pgcrypto | extensions |
| uuid-ossp | extensions |
| pg_stat_statements | extensions |
| supabase_vault | vault |
| plpgsql | pg_catalog |

## 7. Funções (FATO — 36, sendo 30 SECURITY DEFINER)

Críticas para segurança e regra de negócio: `has_course_access`, `has_role`,
`grant_paid_access`, `enroll_in_course`, `get_quiz_eligibility`, `assemble_exam`,
`mark_module_complete`, `validate_certificate`, `get_module_pdf_path`,
`get_module_intro_video_path`, `get_bonus_download_path`, `award_xp`,
`check_achievements`, `register_daily_login`, `admin_list_users`,
`admin_list_payments`, `admin_metrics`, `question_bank_coverage`.

Funções de trigger: `handle_new_user`, `assign_default_role`, `assign_free_plan`,
`auto_promote_admin`, `set_updated_at`, `sync_profile_level`,
`sync_certificate_status`, `enforce_course_publish_rules`,
`enforce_quiz_unlocked`, `issue_certificate_on_pass`, `xp_on_module_complete`,
`xp_on_quiz_attempt`, `xp_on_certificate`.

## 8. Triggers (FATO — 19 em `public`)

| Tabela | Triggers |
| --- | --- |
| certificates | trg_sync_certificate_status, trg_xp_on_certificate |
| course_bonuses | trg_course_bonuses_updated_at |
| courses | trg_courses_publish_rules, trg_courses_updated |
| enrollments | trg_enrollments_updated |
| module_progress | set_module_progress_updated_at, trg_xp_on_module_complete |
| modules | set_modules_updated_at |
| payments | trg_payments_updated |
| plans | trg_plans_updated |
| profiles | profiles_set_updated_at, trg_sync_profile_level |
| questions | trg_questions_updated_at |
| quiz_attempts | trg_enforce_quiz_unlocked, trg_issue_certificate_on_pass, trg_xp_on_quiz_attempt |
| subscriptions | trg_subs_updated |
| tracks | trg_tracks_updated |

Triggers em `auth.users` (`handle_new_user`, `assign_default_role`,
`assign_free_plan`, `auto_promote_admin`): **NÃO VALIDADO** nesta sessão —
schema `auth` sem permissão de leitura. Precisam ser recriados manualmente no
destino.

## 9. Policies RLS (FATO)

42 policies em `public` (distribuição na tabela da seção 2) e 11 em
`storage.objects` cobrindo SELECT/INSERT/UPDATE/DELETE/ALL. Nenhuma tabela de
`public` está sem RLS.

## 10. Grants (FATO)

Todas as 20 tabelas de `public` têm ACL para `anon`, `authenticated` e
`service_role` (`arwdDxtm` — privilégios amplos concedidos por `postgres`).
Recomendação para o destino: **não replicar `arwdDxtm` para `anon`**; conceder
`SELECT` a `anon` apenas em `courses`, `modules`, `tracks`, `plans`,
`achievements`, `certificate_settings` (leitura pública de catálogo) e manter
CRUD para `authenticated` + `ALL` para `service_role`.

## 11. Storage (FATO)

| Bucket | Público | Objetos | Tamanho |
| --- | --- | --- | --- |
| avatars | não | 0 | 0 |
| certificates | não | 1 | 8 KB |
| course-assets | não | 3 | 2.4 MB |
| course-videos | não | 0 | 0 |

O banco guarda **paths**, não URLs: `modules.pdf_path`,
`modules.intro_video_path`, `modules.intro_video_poster_path`,
`course_bonuses.pdf_path`, `courses.full_pdf_path`. Path preservado = nada a
reescrever no banco.

## 12. Endpoints e callbacks

| Item | Valor |
| --- | --- |
| Webhook Asaas | `POST /api/public/webhooks/asaas` (rota TanStack) |
| Validação pública de certificado | `/validar-certificado/:codigo` |
| Base de validação gravada no banco | `certificate_settings.validation_base_url` |
| Redirects de auth (Site URL, reset de senha) | **NÃO VALIDADO** — configuração fica no painel de auth |
| Secrets em uso | ASAAS_API_KEY, ASAAS_WEBHOOK_TOKEN, LOVABLE_API_KEY, SUPABASE_* |

## 13. Objetos legados / órfãos / auditoria

| Objeto | Situação | Ação |
| --- | --- | --- |
| `plans` (6 linhas) | Legado do modelo de planos, abandonado. Ainda referenciado por FK de `payments.plan_id` e `subscriptions.plan_id` | Migrar como está; remoção é sprint separada |
| `subscriptions` (9 linhas) | Criadas pelo trigger `assign_free_plan`; sem uso comercial | Migrar (histórico) |
| `tracks.required_plan` | Legado; 0 linhas com valor ≠ `free` | Migrar coluna, planejar drop depois |
| `xp_log` (48) | Auditoria de XP, inclui ajustes de duplicidade | Migrar integralmente, triggers desligados |
| `gateway_events` (9) | Idempotência de webhook | Migrar (evita reprocessamento) |
| `bonus_downloads` (2) | Auditoria de download | Migrar |
| `certificates` (1) | Emitido; `validation_code` deve ser preservado | Migrar sem regerar |

## Objetos críticos (falha = quebra funcional)

1. `has_course_access` (SECURITY DEFINER + `search_path` fixo) — gate de acesso pago.
2. `has_role` + `user_roles` — separação aluno/admin.
3. Triggers de `quiz_attempts` — gate de 70% e emissão de certificado.
4. `certificates.validation_code` + `validate_certificate` — validação pública.
5. `gateway_events` UNIQUE — idempotência do webhook Asaas.
6. Paths de storage nas 5 colunas listadas.
7. Triggers de `auth.users` — sem eles, novo cadastro não gera `profiles`/role.
