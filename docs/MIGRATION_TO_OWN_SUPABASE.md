# FCIA Academy — Runbook de migração para Supabase próprio

> Status: **plano aprovado, execução não iniciada.**
> Nenhuma alteração foi feita no backend em runtime (`pfaeoekeubkcneqogwho`).
> Este documento é o roteiro operacional das Fases 0 a 7.

## Princípio inegociável

A migração é **copiar e virar a chave**, nunca "mover".
O Lovable Cloud só é desconectado na Fase 7, depois de 7 a 14 dias de operação
estável no Supabase próprio. Desconectar antes apaga banco, storage e usuários
de forma **irreversível**.

---

## Estado verificado na abertura do plano

| Item | Valor |
| --- | --- |
| Backend runtime | Supabase gerenciado pelo Lovable Cloud, ref `pfaeoekeubkcneqogwho` |
| Repositório GitHub conectado | nenhum |
| Migrações versionadas | 59 arquivos em `supabase/migrations/` |
| Edge Functions | nenhuma |
| Rota pública | `src/routes/api/public/webhooks/asaas.ts` |
| Buckets | `avatars`, `course-assets`, `course-videos`, `certificates` (todos privados) |

Contagens de referência (baseline da validação pós-migração):

```text
profiles         9
courses          6
modules         35
questions       77
course_bonuses   4
enrollments      4
payments         2
certificates     1
module_progress  4
quiz_attempts    2
xp_log          41
```

---

## Fase 0 — GitHub como fonte da verdade

1. Menu `+` → GitHub → Connect project.
2. Criar/selecionar o repositório oficial único (sugerido: `fcia-academy`).
3. Confirmar que `supabase/migrations/` subiu completo (59 arquivos).
4. Arquivar `fcia-academy-hub` e `fciaedu` no GitHub.

Sem impacto em runtime.

## Fase 1 — Provisionar o Supabase próprio

1. Criar projeto `fcia-prod` na conta FCIA, região `sa-east-1`.
2. Criar projeto `fcia-staging` na mesma organização.
3. Guardar no cofre da FCIA: Project URL, anon/publishable key,
   service role key, senha do banco.
4. Instalar CLI e linkar:

```bash
supabase login
supabase link --project-ref <REF_NOVO>
```

Sem impacto em runtime.

## Fase 2 — Reconstruir o schema

```bash
supabase db push                    # aplica as 59 migrações no projeto novo
supabase db diff --linked -f convergencia_schema   # captura divergências
```

Rodar primeiro em `fcia-staging`. A migração de convergência cobre seeds e
patches que foram aplicados direto no Cloud e não existem no repo — em especial
o patch de `has_course_access` (SECURITY DEFINER + `search_path` fixo).

Checklist obrigatório antes de seguir:

- RLS habilitada nas 22 tabelas de `public`.
- `GRANT` presente para cada tabela: `authenticated`, `service_role`,
  e `anon` apenas onde existe policy pública.
- Enum `app_role` criado.
- 37 funções presentes, com os 24 `SECURITY DEFINER` intactos.

## Fase 3 — Catálogo

```bash
./scripts/migration/export-data.sh catalog
./scripts/migration/import-data.sh catalog "$TARGET_DB_URL"
```

Conferir: courses 6 · modules 35 · questions 77 · course_bonuses 4.

## Fase 4 — Auth e dados de usuário (janela crítica)

1. Desabilitar triggers no destino (`scripts/migration/toggle-triggers.sql`,
   modo `disable`).
2. Importar `auth.users` preservando `id`, `email`, `encrypted_password`,
   `email_confirmed_at`, `raw_user_meta_data`, `created_at`.
3. Importar dados de usuário na ordem de FK:

```bash
./scripts/migration/export-data.sh user
./scripts/migration/import-data.sh user "$TARGET_DB_URL"
```

4. Reabilitar triggers (modo `enable`).
5. Rodar `scripts/migration/verify-counts.sql` nos dois bancos e comparar,
   incluindo XP total por usuário.

Fallback se o hash de senha não importar: importar usuários sem senha e
disparar redefinição por e-mail (9 usuários, operacionalmente aceitável).

## Fase 5 — Storage

1. Criar os 4 buckets como **privados** no projeto novo.
2. Recriar as policies de `storage.objects`.
3. Copiar objetos preservando o path exato — o banco guarda paths
   (`modules.pdf_path`, `modules.intro_video_path`, `course_bonuses.pdf_path`),
   nunca URLs.
4. Validar contagem **e** tamanho total por bucket.

## Fase 6 — Virada (janela crítica, baixo tráfego)

1. Cadastrar `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN` no ambiente novo.
2. Trocar `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
3. Configurar Site URL e redirect URLs de auth; reativar provedores sociais;
   reativar proteção contra senhas vazadas.
4. Publicar.
5. Reapontar o webhook Asaas para a nova URL pública.
6. Smoke test completo:

```text
[ ] login admin
[ ] login aluno
[ ] catálogo /cursos
[ ] PDF de módulo (URL assinada)
[ ] vídeo de módulo (URL assinada)
[ ] download de bônus
[ ] quiz + aprovação 70%
[ ] emissão de certificado
[ ] validação pública por código
[ ] checkout PIX ponta a ponta com valor baixo
```

Nenhuma refatoração de código é necessária: `src/integrations/supabase/client.ts`,
`client.server.ts` e `auth-middleware.ts` leem tudo de variáveis de ambiente.

## Fase 7 — Estabilização e desligamento

1. Congelar escritas no Cloud (mantido como backup vivo).
2. Operar 7 a 14 dias no Supabase próprio.
3. Backup final completo, guardado fora das duas plataformas.
4. Só então desconectar o Lovable Cloud (**irreversível**).

---

## Modelo de trabalho depois da Fase 6

- Schema: SQL no repo → `supabase db push` via CLI ou GitHub Action.
- As ferramentas nativas de banco do editor Lovable continuam apontando para o
  Cloud e **não devem mais ser usadas** para schema.
- Lovable passa a ser exclusivamente camada de UI/edição de código.
