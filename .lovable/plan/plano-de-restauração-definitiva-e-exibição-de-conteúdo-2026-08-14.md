---
name: Plano de Restauração Definitiva e Exibição de Conteúdo
description: Diagnóstico via Shell e injeção forçada de conteúdo para garantir a exibição dos módulos 1, 2 e 4 no preview.
type: feature
---

# Plano de Restauração Definitiva e Exibição de Conteúdo

O usuário relata que, apesar das ações anteriores, o conteúdo dos módulos 1, 2 e 4 continua sem aparecer no preview (exibindo apenas um espaço em branco ou placeholder). Este plano visa diagnosticar a causa raiz no banco de dados e forçar a atualização via script administrativo, ignorando RLS e cache.

## Ações Imediatas

1. **Diagnóstico Profundo via Shell**:
   - Executar script SQL via `supabase--read_query` para verificar o estado atual da coluna `content_text` e `content_type` especificamente para os módulos problemáticos do curso `influenciador-ia-tiktok-shop`.
   - Verificar se existem caracteres invisíveis ou nulos que impedem a renderização.

2. **Restauração Forçada (Backend-Only)**:
   - Criar e executar um script temporário em `src/lib/restore-db.ts` que utiliza `supabaseAdmin` para injetar o conteúdo pedagógico denso diretamente, sem depender de interações na UI.
   - O script garantirá que:
     - `content_type` seja 'text'.
     - `video_url` seja NULL.
     - `content_text` contenha o Markdown completo revisado.

3. **Validação e Cache**:
   - Após a injeção, disparar uma invalidação global de cache para as queries `learn-course` e `progress`.
   - Utilizar `code--execute_preview_javascript` para forçar um `window.location.reload()` no preview do usuário, garantindo que o novo estado seja carregado.

## Detalhes Técnicos

- **Módulos Alvo**: 1 (Mentalidade), 2 (Estratégia), 4 (Consistência Visual).
- **Ferramentas**: `supabaseAdmin` (bypass RLS), `createServerFn` (execução segura), `queryClient.invalidateQueries`.
- **Prevenção**: Remover qualquer trigger ou lógica que possa estar sobrescrevendo os dados com placeholders vazios durante o processo de sincronização.
