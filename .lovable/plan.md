# Plano: Diagnóstico e Restauração Definitiva de Conteúdo

O usuário relata que, apesar da execução anterior, o conteúdo dos módulos 1, 2 e 4 "continua sem nada" (ou exibindo apenas o caractere invisível `\u2063`). O diagnóstico inicial aponta para uma possível falha na sincronização entre a Server Function e o estado do banco de dados, ou um cache persistente no TanStack Query.

## 1. Diagnóstico Técnico
- **Causa Provável A:** A Server Function `forceRebuildAllModules` foi criada mas talvez não tenha sido executada com sucesso ou o botão na UI não disparou corretamente.
- **Causa Provável B:** RLS (Row Level Security) bloqueando o update, mesmo via `supabaseAdmin` se houver alguma restrição de schema não prevista.
- **Causa Provável C:** O frontend está exibindo dados cacheados (`staleTime: 60_000` na Home e `30_000` no player).

## 2. Ações Imediatas

### Passo 1: Verificação via Shell (Verdade Absoluta)
Executar um script Node.js direto no sandbox usando `supabaseAdmin` para ler o banco de dados e confirmar se as colunas `content_text` dos módulos do curso `influenciador-ia-tiktok-shop` estão realmente preenchidas.

### Passo 2: Execução Forçada (Backend-First)
Se o banco estiver vazio, rodar um script de migração direta via `supabase--migration` ou `code--exec` para injetar o conteúdo sem depender da interação do usuário com o botão da UI.

### Passo 3: Limpeza de Cache de UI
Adicionar um mecanismo de `invalidateQueries` mais agressivo na Home e no Player para garantir que o aluno veja a versão restaurada imediatamente.

### Passo 4: Remoção do Placeholder Invisível
Garantir que nenhum `\u2063` (caractere invisível usado como placeholder) permaneça no `content_text` ou `description`.

## Detalhes Técnicos do Conteúdo (Padrão FCIA Premium)
- **M1:** Mentalidade de "Puppet Master", Nichos de Ouro, Escalabilidade.
- **M2:** Triângulo de Ouro, Persona Estratégica, Branding.
- **M4:** Fim da IA Camaleão, --cref (Character Reference), Seed Mestra.

---
**Nota:** Não farei alterações de texto sugeridas pelo seletor visual, pois o problema é de dados ausentes no banco, não de substituição de string estática no componente.
