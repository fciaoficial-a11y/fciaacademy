# Plano de Reconstrução Premium: Módulo 3 — Criação da Identidade do Influenciador Virtual

Reconstrução pedagógica profunda do Módulo 3 do curso "Influenciador de IA para TikTok Shop", focando na transformação estratégica em identidade visual e verbal coerente, com densidade superior a 12 blocos e injeção via Service Role.

## Atividades Pedagógicas e Estruturais
- Implementar a **Ficha-Mestra de Identidade** como documento central.
- Desenvolver os 12 blocos mandatórios (DNA, Método P.O.N.T.E., Identidade Verbal, etc.).
- Incluir 20 prompts AI-to-AI, 6 atividades práticas e rubricas de avaliação.
- Garantir `video_url: null` e ocultação total de componentes de vídeo.

## Detalhes Técnicos
- **Injeção de Dados:** Utilizar `supabaseAdmin` no arquivo `src/lib/rebuild.functions.ts` para persistir o conteúdo Markdown denso.
- **Formato:** Markdown Purista otimizado para o componente `ModuleArticle` (headings H2 para cards visuais).
- **Validação:** Script Playwright para confirmar renderização dos 12 blocos e ausência de player de vídeo no contexto do aluno.

## Orquestração de Sub-agentes
- 🎨 **UI Architect:** Validar se a ausência de `video_url` remove o player e mantém o layout limpo.
- 🗄️ **Supabase Engineer:** Atualizar a tabela `modules` e `questions` para o curso `influenciador-ia-tiktok-shop`.
- 🔍 **Code Auditor:** Verificar a integridade do Markdown e conformidade com o padrão editorial premium.
- 🧪 **Testing Agent:** Executar teste E2E logado como admin para garantir a entrega final.
