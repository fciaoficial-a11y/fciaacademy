# Plano de Produção Premium: Módulo 7 — Engenharia de Voz e Lip-Sync

Este plano detalha a reconstrução do Módulo 7 do curso "Influenciador de IA para TikTok Shop", focando na profundidade técnica e pedagógica exigida pelo padrão premium da FCIA Academy.

## Objetivos
- Implementar a Ficha-Mestra de Identidade Vocal.
- Detalhar processos de clonagem de voz e lip-sync de alta fidelidade.
- Garantir a remoção total de elementos de vídeo na página do aluno.

## Ações Técnicas

### 1. Produção de Conteúdo (src/lib/rebuild-m7.functions.ts)
Criar arquivo com 12 blocos densos cobrindo:
- **Bloco 1:** O DNA da Voz (Frequência, Timbre, Cadência).
- **Bloco 2:** Psicologia da Voz para Vendas (O tom da autoridade vs. o tom da amizade).
- **Bloco 3:** Engenharia de Script para Voz (Pontuação estratégica e pausas dramáticas).
- **Bloco 4:** Clonagem de Voz (ElevenLabs, HeyGen e ferramentas open-source).
- **Bloco 5:** O Método P.O.N.T.E. aplicado ao Áudio.
- **Bloco 6:** Limpeza e Pós-produção de Áudio (IA para remoção de ruídos).
- **Bloco 7:** Engenharia de Lip-Sync (Wav2Lip, SyncLabs, SadTalker).
- **Bloco 8:** Sincronia de Emoção (Micro-expressões e congruência áudio-visual).
- **Bloco 9:** Tradução e Localização (Como escalar o IV para múltiplos idiomas).
- **Bloco 10:** 20 Prompts Mestre para Direção de Voz.
- **Bloco 11:** Guia de Erros Comuns (O efeito "robótico" e como evitá-lo).
- **Bloco 12:** Projeto Prático: A Primeira Locução Perfeita.

### 2. Integração e Injeção (src/lib/rebuild.functions.ts)
- Mapear o slug `influenciador-ia-m7`.
- Configurar 6 questões de quiz de alta complexidade.
- Garantir `video_url: null` no banco de dados.

### 3. Validação E2E
- Executar script Playwright para confirmar 12+ blocos H2 e palavras-chave técnicas.

## Detalhes Técnicos
- **Course Slug:** `influenciador-ia-tiktok-shop`
- **Module Slug:** `influenciador-ia-m7`
- **Role:** Admin (`blindadoemotivado@gmail.com`)
