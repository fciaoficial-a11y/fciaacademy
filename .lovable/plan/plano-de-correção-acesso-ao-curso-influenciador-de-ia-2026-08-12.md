# Plano de Correção: Acesso ao Curso "Influenciador de IA"

O curso "Influenciador de IA para TikTok Shop" foi criado com `is_published = false` (modo standby) conforme solicitado anteriormente. A consulta `courseLearnQuery` filtra apenas cursos onde `is_published = true`, o que causa o erro "Curso não encontrado" mesmo para administradores.

## Ações Propostas

### 1. Ajuste na Consulta de Dados
Modificar `src/lib/learn-queries.ts` para permitir que administradores (ou a consulta em si) ignorem o filtro `is_published` se necessário. No entanto, a solução mais robusta e simples para o ambiente de desenvolvimento/admin é permitir que a página de visualização carregue o curso independentemente do status de publicação, já que o componente `CourseLearnPage` já possui lógica de verificação de permissão (`hasAccess`).

*   **Alteração**: Remover ou tornar condicional o filtro `.eq("is_published", true)` na função `courseLearnQuery`.

### 2. Publicação do Curso (Opcional)
Se o objetivo for testar o fluxo como aluno, o curso precisa ser publicado.
*   **Ação**: Executar uma migração SQL para definir `is_published = true` para o curso e seus módulos.

## Detalhes Técnicos

### Arquivos a serem modificados:
- `src/lib/learn-queries.ts`: Remover a restrição de publicação na query principal para permitir visualização prévia.

### Script SQL de ativação:
```sql
UPDATE public.courses SET is_published = true WHERE slug = 'influenciador-ia-tiktok-shop';
UPDATE public.modules SET is_published = true WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'influenciador-ia-tiktok-shop');
```

---
**Nota**: O curso existe no banco de dados (ID `e23cf598-23be-4dbe-b8f0-4c3a420d9b62`), mas está invisível devido ao status de publicação.