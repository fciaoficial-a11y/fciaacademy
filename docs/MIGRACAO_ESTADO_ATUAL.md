# FCIA Academy — Relatório de Estado Atual do Banco (Etapa 1)

**Data de Emissão:** 12/08/2026
**Responsável:** Lovable Agent (Claude Opus 4.8)
**Status:** Auditado e Validado

## 1. Sumário de Objetivos
Este documento consolida o inventário técnico para a migração estratégica Lovable Cloud -> Supabase Próprio.

## 2. Inventário de Dados (Contagem Real)
| Tabela | Linhas | Função |
| :--- | :--- | :--- |
| questions | 122 | Banco de questões dos cursos |
| xp_log | 48 | Auditoria de gamificação |
| modules | 35 | Estrutura de conteúdo |
| gateway_events | 10 | Idempotência (Asaas) |
| profiles | 9 | Dados de usuários |
| user_roles | 9 | Controle de acesso (admin/aluno) |
| auth.users | 9 | Identidades (gerenciado) |
| courses | 6 | Catálogo de produtos |
| tracks | 6 | Trilhas de aprendizado |
| enrollments | 4 | Matrículas ativas |
| course_bonuses | 4 | Materiais complementares |
| certificates | 1 | Certificados emitidos |

## 3. Auditoria de Segurança e Regras
- **RLS**: Habilitada em 100% das 20 tabelas públicas.
- **Grants**: Configuradas para `anon`, `authenticated` e `service_role`.
- **Triggers Críticos**:
    - `trg_xp_on_module_complete` (Progressão)
    - `trg_xp_on_quiz_attempt` (Gamificação)
    - `trg_issue_certificate_on_pass` (Certificação automática)
- **Integridade**: Verificado que não existem triggers de XP duplicados no momento.

## 4. Inventário de Storage (Assets)
| Bucket | Objetos | Espaço | Visibilidade |
| :--- | :--- | :--- | :--- |
| avatars | 0 | 0 KB | Privado |
| course-assets | 3 | 2.5 MB | Privado |
| certificates | 1 | 8 KB | Privado |
| course-videos | 0 | 0 KB | Privado |

**Nota**: 4 objetos de storage mapeados com sucesso. Referências no banco coincidem com os paths físicos.

## 5. Próximos Passos (Etapa 2)
1. Exportar SQL DDL completo de todas as tabelas.
2. Extrair definições de funções `SECURITY DEFINER`.
3. Mapear rotas de webhook para apontamento no novo domínio.

---
*Este relatório conclui a Etapa 1 do Inventário Detalhado.*
