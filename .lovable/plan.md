# Plano de Produção Premium: Módulo 4

Este plano detalha a implementação do conteúdo denso para o **Módulo 4 — Consistência Visual, Ficha Técnica e Biblioteca de Identidade** do curso de Influenciador de IA, seguindo os rigorosos padrões editoriais da FCIA Academy.

## Alterações Propostas

### Backend & Conteúdo (Supabase)
- **Criação de `src/lib/rebuild-m4.functions.ts`**: Arquivo isolado contendo o Markdown purista com os 12 blocos de aprofundamento, tabelas técnicas, checklists e a Ficha Técnica Visual completa.
- **Atualização de `src/lib/rebuild.functions.ts`**: Integração do conteúdo do Módulo 4 no orquestrador de reconstrução e inclusão de questões de quiz de alta dificuldade.
- **Script de Injeção `src/scripts/restore-m4.ts`**: Script para forçar a atualização via `supabaseAdmin`, garantindo que `video_url` seja nulo e o conteúdo seja injetado corretamente.

### Estrutura do Conteúdo (12 Blocos Premium)
1. **O que é Consistência Visual**: Diferenciação entre amador e profissional.
2. **Da Ficha-Mestra à Ficha Técnica Visual**: Atributos técnicos (pele, rosto, olhos, mandíbula).
3. **Character Reference (CREF)**: Uso de imagens âncora e ângulos.
4. **Seed Master**: Controle de ruído e sementes de geração.
5. **Elementos Fixos, Variáveis e Proibidos**: Matriz de controle de marca.
6. **Prompt-Base de Identidade**: Engenharia de prompts estruturada em blocos.
7. **Prompts de Variação Controlada**: Unboxing, tutoriais e lifestyle.
8. **Biblioteca de Identidade**: Organização de ativos e curadoria.
9. **Detecção de Inconsistências**: Identificação de artefatos e erros de anatomia.
10. **Projeto Preenchível**: Sistema Visual-Mestre.
11. **Checkpoint Verificável**: Rubrica de qualidade.
12. **Plano de Ação de 7 Dias**: Roteiro de implementação prática.

## Detalhes Técnicos
- **video_url: null**: Remoção completa de referências a vídeo no layout.
- **Markdown Purista**: Compatibilidade total com o `ModuleArticle`.
- **Validação E2E**: Teste automatizado via Playwright para garantir que todos os blocos H2 sejam renderizados.

## Verificação
1. Executar o script de restauração.
2. Validar via preview que o Módulo 4 exibe o conteúdo premium.
3. Confirmar a ausência do player de vídeo.
