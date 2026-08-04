# FCIA Academy — P3: Mapa de Criação do Schema no Novo Supabase

Escopo: **somente schema** (estrutura, segurança, buckets). Nenhum `INSERT` de dados
aqui — carga de dados é a Fase 4 (`scripts/migration/import-data.sh`).

Fonte de verdade da estrutura: `migration/fcia_academy_full_schema.sql`
Auditoria/geração de DDL: `scripts/migration/audit-export.sql`
Verificação pós-carga: `scripts/migration/verify-counts.sql`

Assinatura esperada no destino ao fim deste plano:
20 tabelas em `public`, 57 índices, 40 policies em `public`, 11 policies em `storage`,
36 funções, 19 triggers em `public`, 4 triggers em `auth.users`, 4 buckets.

---

## Regra de ouro da ordem

```
0. pré-requisitos do projeto (auth habilitado)
1. extensões  →  2. enums  →  3. tabelas raiz  →  4. tabelas dependentes
5. índices    →  6. FKs (se criadas fora do CREATE TABLE)
7. funções    →  8. triggers  →  9. RLS policies  →  10. grants  →  11. buckets
```

Motivo: funções antes de triggers (trigger referencia função); policies depois de
funções (`has_role`, `has_course_access` são usadas em `USING`); grants por último
porque PostgREST só respeita ACL após a tabela existir; buckets independentes, mas
as policies de `storage.objects` dependem de `has_course_access`.

⚠️ **Risco global:** rodar policies antes das funções `SECURITY DEFINER` quebra a
criação inteira (`function public.has_role(uuid, app_role) does not exist`).

---

## Passo 0 — Pré-requisitos (obrigatório)

| Item | Por quê |
| --- | --- |
| Projeto Supabase criado, região definida | `auth.users` precisa existir antes de qualquer FK |
| Auth Email/Password habilitado | 21 FKs apontam para `auth.users` |
| Site URL + Redirect URLs configuradas | login/reset quebram sem isso |
| Secrets `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `LOVABLE_API_KEY` | webhook e IA |

⚠️ Não é possível alterar o schema `auth` por migração. Os 4 triggers de signup são
criados como exceção controlada (Passo 8b) via SQL editor com role privilegiada.

---

## Passo 1 — Extensões (obrigatório)

```sql
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto      WITH SCHEMA extensions;  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"   WITH SCHEMA extensions;  -- legado
```

Opcionais (observabilidade / já presentes por padrão no Supabase):
`pg_stat_statements`, `supabase_vault`, `plpgsql` (built-in, não recriar).

⚠️ `gen_random_uuid()` é default de PK em 18 tabelas. Sem `pgcrypto` **todo**
`CREATE TABLE` do Passo 3/4 falha.

---

## Passo 2 — Enums (obrigatório)

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'aluno');
```

Único tipo customizado. Ordem dos labels importa (`admin` primeiro) para comparações.
Demais “enums” do projeto são `TEXT + CHECK` e vêm junto com as tabelas.

---

## Passo 3 — Tabelas sem dependências (raiz)

Ordem executável; nenhuma delas referencia outra tabela de `public`.

| # | Tabela | Dependências | Nota |
| --- | --- | --- | --- |
| 3.1 | `plans` | — (PK `text`) | **legado**, mantido só por FK histórica de `payments`/`subscriptions` |
| 3.2 | `achievements` | — | obrigatório (gamificação) |
| 3.3 | `certificate_settings` | — (PK fixa `id = 1`) | obrigatório (certificado) |
| 3.4 | `tracks` | — | obrigatório (`courses.track_id` é NOT NULL) |
| 3.5 | `gateway_events` | — | obrigatório (idempotência do webhook Asaas) |
| 3.6 | `profiles` | `auth.users(id)` | precisa de Auth pronto, não de `public` |
| 3.7 | `user_roles` | `auth.users(id)` + enum `app_role` | depende do Passo 2 |

⚠️ `plans` só pode ser descartada se as FKs `payments.plan_id` e
`subscriptions.plan_id` forem removidas na mesma migração. Enquanto o modelo
PIX-avulso conviver com histórico, **mantenha**.

---

## Passo 4 — Tabelas dependentes (ordem topológica)

Cada linha só pode ser criada depois de todas as suas dependências.

| # | Tabela | Depende de |
| --- | --- | --- |
| 4.1 | `courses` | `tracks` |
| 4.2 | `modules` | `courses` |
| 4.3 | `questions` | `modules`, `courses` |
| 4.4 | `course_bonuses` | `courses` |
| 4.5 | `enrollments` | `courses`, `tracks`, `auth.users` |
| 4.6 | `subscriptions` | `plans`, `auth.users` |
| 4.7 | `payments` | `plans`, `courses`, `auth.users` |
| 4.8 | `module_progress` | `modules`, `courses`, `auth.users` |
| 4.9 | `quiz_attempts` | `modules`, `courses`, `auth.users` |
| 4.10 | `certificates` | `courses`, `auth.users` |
| 4.11 | `xp_log` | `auth.users` |
| 4.12 | `user_achievements` | `achievements`, `auth.users` |
| 4.13 | `bonus_downloads` | `course_bonuses`, `auth.users` |

Total: 7 raiz + 13 dependentes = **20 tabelas**.

### UNIQUEs que não podem ser esquecidas
São elas que sustentam todo `ON CONFLICT` do app — omitir causa duplicação silenciosa:

- `courses(slug)`, `modules(course_id, slug)`, `tracks(slug)`, `course_bonuses(course_id, slug)`
- `enrollments(user_id, course_id)` → `enroll_in_course`, `grant_paid_access`
- `module_progress(user_id, module_id)` → `mark_module_complete`
- `certificates(user_id, course_id)` e `certificates(validation_code)` → emissão automática
- `user_roles(user_id, role)` → `assign_default_role`
- `user_achievements(user_id, achievement_id)` → `check_achievements`
- `payments(provider, provider_payment_id)`, `gateway_events(provider, event_id)` → idempotência

### CHECKs obrigatórios
`courses.product_type IN ('course','ebook')`, `courses.level`, `modules.content_type`,
`questions.status/difficulty/source_type`, `payments.status/billing_type`,
`subscriptions.status`, `profiles.status`, `certificates.status`.

⚠️ Não use CHECK com `now()` em nenhum lugar (quebra restore). Validação temporal
fica em trigger.

---

## Passo 5 — Índices (25 explícitos + 32 de constraint)

Os 32 de PK/UNIQUE nascem no Passo 3/4. Criar depois os 25 explícitos:

```
questions:        idx_questions_course_status, idx_questions_module_status,
                  idx_questions_module, idx_questions_difficulty
course_bonuses:   idx_course_bonuses_course (parcial: WHERE is_published)
bonus_downloads:  idx_bonus_downloads_user, idx_bonus_downloads_bonus
enrollments:      idx_enrollments_user, idx_enrollments_course
payments:         idx_payments_user_created, idx_payments_provider_payment,
                  idx_payments_status, idx_payments_course, idx_payments_plan
certificates:     idx_certificates_code, idx_certificates_user
courses:          idx_courses_published, idx_courses_track_id
modules:          idx_modules_course
module_progress:  idx_progress_user_course
quiz_attempts:    idx_quiz_attempts_user_module
subscriptions:    idx_subscriptions_user, idx_subscriptions_active
xp_log:           idx_xp_log_user_created
```

Classificação: **obrigatórios** — `idx_payments_provider_payment`,
`idx_certificates_code`, `idx_enrollments_*`, `idx_progress_user_course`
(usados em caminho quente / RLS). **Opcionais** (performance) —
`idx_questions_difficulty`, `idx_subscriptions_*`, `idx_payments_plan`.

💡 Se for criar índice **após** a carga de dados, use `CREATE INDEX CONCURRENTLY`
fora de transação.

---

## Passo 6 — Foreign keys (28)

Recomendado: declarar inline no `CREATE TABLE` seguindo a ordem do Passo 4 —
zero FK pendente. Se optar por criar as tabelas todas primeiro e as FKs depois
(`ALTER TABLE ... ADD CONSTRAINT`), respeite as ações exatas:

- `ON DELETE CASCADE` (25): todas as FKs para `auth.users`, `courses`, `modules`,
  `tracks→courses`, `achievements`, `course_bonuses`.
- `ON DELETE SET NULL` (2): `enrollments.track_id`, `payments.course_id`.
- **Sem ação** (2): `payments.plan_id`, `subscriptions.plan_id` → `plans(id)`.

⚠️ `payments.course_id` é `SET NULL` de propósito: apagar um curso não pode apagar
o histórico financeiro. Trocar para CASCADE = perda de dados contábeis.

---

## Passo 7 — Funções (36)

Criar antes de triggers e policies. Ordem por dependência interna:

1. **Puras / base:** `plan_rank`, `compute_level`, `set_updated_at`,
   `sync_profile_level`, `sync_certificate_status`
2. **Segurança (bloqueadores de policy):** `has_role` → `current_plan` →
   `can_access_track` → `has_course_access`
3. **Gamificação:** `award_xp` → `check_achievements` → `xp_on_module_complete`,
   `xp_on_quiz_attempt`, `xp_on_certificate`, `register_daily_login`
4. **Acesso/matrícula:** `enroll_in_course`, `grant_paid_access`
5. **Aprendizado:** `get_quiz_eligibility` → `mark_module_complete`,
   `enforce_quiz_unlocked`, `assemble_exam`, `mark_questions_used`
6. **Conteúdo protegido:** `get_module_pdf_path`, `get_module_intro_video_path`,
   `get_bonus_download_path`
7. **Certificados:** `issue_certificate_on_pass`, `validate_certificate`
8. **Publicação:** `enforce_course_publish_rules`
9. **Signup (usadas por triggers em `auth`):** `handle_new_user`,
   `assign_default_role`, `assign_free_plan`, `auto_promote_admin`
10. **Admin/relatório (opcionais para o app rodar):** `admin_list_users`,
    `admin_list_payments`, `admin_metrics`, `question_bank_coverage`

Regras: todas com `SET search_path = public` (30 são `SECURITY DEFINER`).
⚠️ `SECURITY DEFINER` sem `search_path` fixo = vetor de escalonamento; o bloco 5.2
de `audit-export.sql` deve retornar zero linhas no destino.

Críticas (sem elas a plataforma não funciona): `has_role`, `has_course_access`,
`get_quiz_eligibility`, `mark_module_complete`, `grant_paid_access`,
`issue_certificate_on_pass`.

---

## Passo 8 — Triggers

### 8a — `public` (19, obrigatórios)

```
updated_at:      courses, modules, tracks, plans, profiles, payments,
                 subscriptions, enrollments, module_progress, questions,
                 course_bonuses      → set_updated_at()
profiles:        trg_sync_profile_level (INSERT + UPDATE)
certificates:    trg_sync_certificate_status (INSERT + UPDATE), trg_xp_on_certificate
module_progress: trg_xp_on_module_complete (INSERT + UPDATE)
quiz_attempts:   trg_enforce_quiz_unlocked (BEFORE), trg_issue_certificate_on_pass,
                 trg_xp_on_quiz_attempt
courses:         trg_courses_publish_rules (INSERT + UPDATE)
```

⚠️ **Nunca duplicar** trigger XP na mesma tabela — o incidente de +250 XP na origem
veio de `trg_xp_module` duplicado. Rode o bloco 6.3 de `audit-export.sql`: deve
retornar zero linhas.

### 8b — `auth.users` (4, obrigatórios, exceção controlada)

`on_auth_user_created_profile`, `_role`, `_plan`, `_admin`.
Sem eles: usuário novo sem `profiles` → app quebra no primeiro login.
⚠️ Desabilite-os antes de importar usuários (Fase 4) e reabilite depois
(`scripts/migration/toggle-triggers.sql`), senão profiles/XP são gerados em dobro.
⚠️ `auto_promote_admin` tem o e-mail master hardcoded — confirmar antes de aplicar.

---

## Passo 9 — Policies RLS (40 em `public` + 11 em `storage`)

Para cada uma das 20 tabelas, na ordem:
`ALTER TABLE public.<t> ENABLE ROW LEVEL SECURITY;` e só então os `CREATE POLICY`.

Padrões:

| Grupo | Tabelas | Regra |
| --- | --- | --- |
| Catálogo público | `courses`, `modules`, `tracks`, `plans`, `achievements`, `certificate_settings`, `course_bonuses` | leitura para todos quando publicado; escrita só `has_role(auth.uid(),'admin')` |
| Dados do aluno | `profiles`, `enrollments`, `module_progress`, `quiz_attempts`, `certificates`, `xp_log`, `user_achievements`, `bonus_downloads`, `subscriptions` | `user_id = auth.uid()` (+ admin) |
| Conteúdo pago | `questions` | `has_course_access(auth.uid(), course_id)` |
| Financeiro | `payments`, `gateway_events` | leitura própria / admin; escrita só service_role (webhook) |
| Papéis | `user_roles` | leitura própria; escrita só admin |

⚠️ `has_course_access` já está endurecida: curso pago exige enrollment **ou** admin.
Não recriar a versão antiga (permitia acesso por plano) — regressão de receita.
⚠️ Tabelas sem policy = 100% inacessíveis. O bloco 4.4 do audit deve retornar zero.

Policies de `storage.objects` (11) só depois dos buckets do Passo 11.

---

## Passo 10 — Grants (obrigatório)

Sem `GRANT`, PostgREST responde `permission denied` mesmo com RLS correta.

```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- padrão para tabela de usuário
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<t> TO authenticated;
GRANT ALL ON public.<t> TO service_role;

-- somente tabelas de leitura pública
GRANT SELECT ON public.courses, public.modules, public.tracks,
                public.plans, public.achievements,
                public.certificate_settings, public.course_bonuses TO anon;
```

Sem `anon`: `payments`, `gateway_events`, `user_roles`, `profiles`, `enrollments`,
`module_progress`, `quiz_attempts`, `certificates`, `xp_log`, `user_achievements`,
`bonus_downloads`, `subscriptions`, `questions`.

Funções: `EXECUTE` para `authenticated` nas RPCs do app; `validate_certificate`
também para `anon` (validação pública de certificado).
Gerador pronto: bloco 8.3 de `audit-export.sql`.

---

## Passo 11 — Storage buckets (obrigatório)

Todos **privados** (`public = false`), acesso apenas por signed URL:

| Bucket | Uso | Referenciado por |
| --- | --- | --- |
| `course-assets` | PDFs de módulo e bônus | `modules.pdf_path`, `course_bonuses.pdf_path`, `courses.full_pdf_path` |
| `course-videos` | vídeos de intro + poster | `modules.intro_video_path`, `intro_video_poster_path` |
| `certificates` | PDFs emitidos | `certificates.pdf_url` |
| `avatars` | foto de perfil | `profiles.avatar_url` |

Depois: as 11 policies de `storage.objects` (dono do arquivo por prefixo de
`user_id` para `avatars`; `has_course_access` para conteúdo pago; admin para upload).

⚠️ **Path é contrato.** O caminho de cada objeto precisa ser idêntico ao da origem,
senão as colunas `*_path` apontam para o vazio.
⚠️ 4 PDFs hoje apontam para assets externos (`/__l5e/assets-v1/...`) — precisam ser
baixados e reenviados para `course-assets` na Fase 4, com update das colunas.

---

## Checklist de aceite do schema (antes da Fase 4)

```sql
-- roda scripts/migration/audit-export.sql no destino e compara a assinatura
```

- [ ] 20 tabelas em `public`
- [ ] 1 enum (`app_role`)
- [ ] 28 FKs com as ações exatas do Passo 6
- [ ] 57 índices
- [ ] 36 funções, zero `SECURITY DEFINER` sem `search_path`
- [ ] 19 triggers em `public`, zero duplicado; 4 em `auth.users`
- [ ] RLS habilitada em 20/20; 40 policies em `public`, 11 em `storage`
- [ ] Grants conferem com o bloco 8.2/8.3
- [ ] 4 buckets privados criados
- [ ] `SELECT count(*)` de toda tabela = 0 (schema puro, sem dados)

## Fora de escopo deste passo

Dados de catálogo, usuários, matrículas, pagamentos, XP e objetos de storage —
tudo na Fase 4 (`export-data.sh` → `toggle-triggers.sql disable` → `import-data.sh`
→ `toggle-triggers.sql enable` → `verify-counts.sql`).
