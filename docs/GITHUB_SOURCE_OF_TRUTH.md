# FCIA Academy — Repositório oficial e fonte da verdade do schema

> Regra: **um único repositório GitHub oficial** conectado ao projeto Lovable, e
> `supabase/migrations/` como **única** fonte da verdade do schema.

---

## 1. Estado atual

| Item | Situação |
| --- | --- |
| Repositório GitHub conectado | **nenhum** (projeto remixado, não herdou conexão) |
| Repositório em runtime | repo interno do Lovable (`aa7574e5-7b21-4a81-ad58-e38d25cea373`) |
| Backend em runtime | Supabase gerenciado pelo Lovable Cloud, ref `pfaeoekeubkcneqogwho` |
| Migrações versionadas | 59 arquivos em `supabase/migrations/` |

O Lovable permite **apenas um** repositório GitHub por projeto — a própria
plataforma impede o cenário de dois repos oficiais concorrentes.

## 2. Conectar o repositório oficial (ação manual, no editor)

Esta etapa não pode ser executada por código — é um fluxo de autorização OAuth.

1. No editor Lovable: menu **`+`** (canto inferior esquerdo do chat) → **GitHub**
   → **Connect project**.
2. Autorizar o GitHub App do Lovable na conta/organização da FCIA.
3. Selecionar a organização e clicar em **Create Repository**.
   Nome oficial sugerido: **`fcia-academy`**.
4. Aguardar o primeiro push automático e conferir no GitHub:
   - `supabase/migrations/` com os 59 arquivos;
   - `docs/`, `scripts/migration/`, `src/`;
   - `.env` **não** deve aparecer (está no `.gitignore`).

A partir daí a sincronização é bidirecional: alterações no Lovable viram commit,
e pushes na branch `main` voltam para o editor.

## 3. Repositórios antigos

Depois que `fcia-academy` estiver sincronizado, os repos legados
(`fcia-academy-hub`, `fciaedu`) devem ser **arquivados** no GitHub
(Settings → Archive this repository), nunca deletados. Arquivar preserva o
histórico e elimina a ambiguidade de "qual é o oficial".

## 4. Fonte da verdade do schema

**Autoritativo:** `supabase/migrations/*.sql` — ordenado por timestamp,
imutável depois de aplicado.

**Derivado (nunca editar à mão):**

| Arquivo | O que é |
| --- | --- |
| `migration/fcia_academy_full_schema.sql` | DDL consolidado, gerado a partir das migrações. Snapshot de conveniência para provisionar um projeto vazio. |
| `src/integrations/supabase/types.ts` | Tipos gerados automaticamente após cada migração aplicada. |

### Regras de alteração de schema

1. Toda mudança de schema nasce como **um novo arquivo** em
   `supabase/migrations/`. Nunca editar uma migração já aplicada.
2. Seeds de conteúdo que precisam ser reproduzíveis também viram migração
   idempotente (`ON CONFLICT ... DO UPDATE`), como
   `20260729234900_seed_metodo_influencer_ia_commerce.sql`.
3. Todo `CREATE TABLE` em `public` inclui, na mesma migração:
   `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY`.
4. Nenhuma alteração de schema aplicada direto no painel/SQL ad-hoc sem a
   migração correspondente no repo. Se acontecer, gerar a migração de
   convergência na mesma sessão.
5. `migration/fcia_academy_full_schema.sql` é regenerado, não editado.

### Verificação de drift

```bash
./scripts/migration/check-schema-drift.sh
```

O script compara as tabelas do banco em runtime com as tabelas declaradas em
`supabase/migrations/`. Qualquer tabela que exista só de um lado é drift e
precisa de migração de convergência.

## 5. Relação com a migração para Supabase próprio

Este documento cobre a **Fase 0** do runbook
[`docs/MIGRATION_TO_OWN_SUPABASE.md`](./MIGRATION_TO_OWN_SUPABASE.md).
Com GitHub conectado e o schema versionado, a Fase 1 (provisionar o Supabase
próprio) pode começar — `supabase db push` passa a reconstruir o banco inteiro
a partir do repositório.
