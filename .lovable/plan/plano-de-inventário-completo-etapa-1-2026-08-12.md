---
name: Migração de Banco de Dados (Inventário Completo)
description: Plano para execução da Etapa 1 do inventário detalhado para migração do Lovable Cloud para Supabase próprio.
type: feature
---

# Plano de Inventário Completo (Etapa 1)

Este plano detalha a execução da primeira fase da migração estratégica da FCIA Academy: o levantamento exaustivo de todos os objetos e configurações do banco de dados atual (Lovable Cloud).

## Objetivos da Etapa 1
1. **Consolidar o Inventário**: Reunir dados dispersos em um único ponto de verdade.
2. **Auditoria de Segurança**: Validar RLS, Grants e configurações de Security Definer.
3. **Mapeamento de Dependências**: Identificar FKs, Triggers e ordem de criação.
4. **Inventário de Assets**: Listar todos os arquivos no Storage e suas referências.

## Etapas de Execução

### 1. Levantamento de Estrutura (SQL)
- Executar scripts de auditoria para capturar DDL de:
  - Tabelas e Views.
  - Funções (especialmente as críticas como `has_course_access`).
  - Triggers (verificando duplicidade de XP).
  - Policies de RLS (Public e Storage).
  - Grants (Anon, Authenticated, Service Role).

### 2. Levantamento de Dados e Negócio
- Contagem exata de linhas por tabela.
- Levantamento de Enums e tipos customizados.
- Identificação de objetos legados (ex: tabela `plans` e coluna `required_plan`).
- Mapeamento de usuários (Auth) e seus respectivos perfis/roles.

### 3. Levantamento de Infraestrutura e Conectividade
- Listagem de Buckets de Storage e volume de dados.
- Mapeamento de Secrets do sistema (Asaas, Lovable API, etc).
- Identificação de Webhooks e rotas de callback.

### 4. Consolidação da Documentação
- Atualizar `docs/MIGRACAO_P1_INVENTARIO.md` com os dados finais validados.
- Criar `docs/MIGRACAO_ESTADO_ATUAL.md` como um resumo executivo da saúde do banco.

## Critérios de Sucesso
- 100% das tabelas mapeadas com suas PKs e FKs.
- RLS validada em todas as tabelas públicas.
- Lista completa de funções e triggers pronta para exportação.
- Inventário de storage reconciliado com as referências no banco.

## Detalhes Técnicos
- **Banco de Origem**: Lovable Cloud (ref `pfaeoekeubkcneqogwho`).
- **Ferramentas**: SQL nativo, auditoria via scripts internos.
- **Saída**: Markdown consolidado e scripts SQL de exportação.
