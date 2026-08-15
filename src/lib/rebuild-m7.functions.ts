/**
 * MÓDULO 7 — VOZ E LIP-SYNC PROFISSIONAL
 * Conteúdo premium isolado (proteção contra regressão).
 * Este arquivo é a ÚNICA fonte de verdade do Módulo 7.
 * NÃO altera, consulta ou depende dos Módulos 0 a 6.
 */

export const titleM7 = "MÓDULO 7 — Voz e Lip-Sync Profissional";

export const contentM7Premium = `
# Módulo 7 — Voz e Lip-Sync Profissional

## Objetivo do Módulo
Transformar o influenciador virtual em uma presença **audível e crível**. Até aqui você construiu identidade, consistência visual e movimento. Agora entra a camada que mais rápido destrói — ou consolida — a confiança do espectador: a voz. Ao final deste módulo você dominará a **Pipeline de Áudio Comercial** (direção de voz, geração, tratamento, sincronização labial e controle de qualidade) e saberá diagnosticar tecnicamente por que um vídeo "parece falso" mesmo quando a imagem está perfeita.

> Regra estruturante do módulo: **imagem errada gera desconfiança; áudio errado gera rejeição.** O ouvido humano detecta artificialidade em menos de 400 milissegundos.

---

## BLOCO 1 — POR QUE A VOZ É O PONTO DE RUPTURA

**Explicação Conceitual:**
O cérebro processa voz em uma via evolutivamente mais antiga que a leitura de rostos sintéticos. Timbre, respiração, hesitação e ritmo são marcadores biológicos de presença. Um rosto de IA quase perfeito com voz robótica produz o efeito **vale da estranheza auditivo**: o espectador não sabe explicar o incômodo, apenas desliza o dedo para cima.

**Aplicação Prática:**
Trate a voz como produto, não como acessório. Antes de gerar qualquer áudio, defina três parâmetros fixos: **timbre**, **energia** e **tempo de fala** (palavras por minuto). Esses três valores tornam-se lei para todos os vídeos do canal.

**Exemplo Completo:**
- Timbre: feminino jovem-adulto, levemente rouco, brasileiro neutro com leve traço paulistano.
- Energia: 7/10 (entusiasmo contido, sem grito publicitário).
- Ritmo: 155 palavras por minuto, com pausa de 300ms antes do benefício principal.

**Erro Comum:** Trocar de voz entre vídeos porque "essa ficou melhor".
**Consequência:** O canal perde reconhecimento auditivo, o pilar mais forte de memória de marca.
**Forma Correta:** Congelar a ficha de voz e versioná-la como ativo (VOICE-MASTER-01).

**Exercício:** Escreva a ficha de voz do seu influenciador com os três parâmetros e uma frase-assinatura.
**Pergunta de Reflexão:** Se alguém ouvisse 5 segundos do seu áudio sem imagem, reconheceria o canal?
**Critério de Conclusão:** Ficha VOICE-MASTER documentada e imutável.

---

## BLOCO 2 — FICHA TÉCNICA DE VOZ (VOICE-MASTER)

**Explicação Conceitual:**
Assim como a ficha visual garante consistência de rosto, a ficha de voz garante consistência sonora. Ela deve ser reprodutível por qualquer ferramenta, hoje ou dentro de dois anos.

**Estrutura obrigatória da VOICE-MASTER:**
1. **Identificador:** VOICE-MASTER-01
2. **Gênero e faixa etária percebida**
3. **Sotaque e região**
4. **Timbre** (claro / médio / grave / rouco)
5. **Energia base** (escala 1–10)
6. **Velocidade** (palavras por minuto)
7. **Assinatura de abertura** (frase fixa de 3 a 5 palavras)
8. **Assinatura de fechamento** (CTA falado padrão)
9. **Proibições** (ex: nunca gritar, nunca usar gíria regional específica)
10. **Amostra de referência aprovada** (arquivo mestre de 15 segundos)

**Exemplo Completo:**
\`\`\`
VOICE-MASTER-01
Gênero/idade: feminino, 27 anos percebidos
Sotaque: português brasileiro neutro
Timbre: médio com leve rouquidão
Energia: 7/10
Velocidade: 155 wpm
Abertura: "Olha isso aqui"
Fechamento: "Link na vitrine, corre"
Proibições: sem grito, sem tom infantilizado, sem estrangeirismo forçado
Amostra mestre: voice-master-01-ref.wav
\`\`\`

**Erro Comum:** Documentar apenas "voz feminina jovem".
**Consequência:** Cada geração produz uma pessoa diferente.
**Forma Correta:** Descrição paramétrica com amostra de referência anexada.

**Exercício:** Preencha os 10 campos da sua VOICE-MASTER.
**Critério de Conclusão:** Ficha completa, com amostra mestre salva na biblioteca de identidade.

---

## BLOCO 3 — DIREÇÃO DE VOZ: O ROTEIRO FALADO NÃO É O ROTEIRO ESCRITO

**Explicação Conceitual:**
Texto escrito para leitura tem sintaxe longa; texto escrito para fala tem respiração. Todo roteiro precisa passar por uma etapa de **oralização**: frases curtas, verbos no presente, zero subordinação complexa.

**Regras de oralização:**
- Máximo de 12 palavras por frase falada.
- Uma ideia por respiração.
- Nunca iniciar frase com conectivo formal ("portanto", "entretanto").
- Marcar pausas com quebras de linha, não com vírgulas empilhadas.

**Exemplo Completo — antes e depois:**

Antes (texto escrito):
"Este organizador multifuncional, que possui compartimentos ajustáveis, é ideal para quem precisa otimizar o espaço da mesa de trabalho."

Depois (texto falado):
"Sua mesa vive bagunçada?
Esse organizador tem divisórias que se ajustam.
Cabe tudo. E ainda sobra espaço."

**Erro Comum:** Enviar para a IA o texto de vendas do marketplace.
**Consequência:** Locução travada, ritmo de leitura de bula, retenção despencando no segundo 3.
**Forma Correta:** Oralizar antes de gerar, sempre.

**Exercício:** Oralize um parágrafo de descrição de produto real em três frases faladas.
**Critério de Conclusão:** Roteiro falado com nenhuma frase acima de 12 palavras.

---

## BLOCO 4 — MARCAÇÃO PROSÓDICA (O SEGREDO DA NATURALIDADE)

**Explicação Conceitual:**
Prosódia é a música da fala: ênfase, pausa, entonação e alongamento. Ferramentas de voz respondem a marcações explícitas. Quem escreve marcação prosódica obtém áudio humano; quem envia texto cru obtém leitura automática.

**Sistema de marcação FCIA (padrão do curso):**
- \`[pausa curta]\` = 250ms
- \`[pausa longa]\` = 600ms
- \`*palavra*\` = ênfase tônica
- \`(sussurro)\` = redução de energia para segredo/confidência
- \`(sorriso)\` = elevação de brilho no timbre
- \`↑\` no fim da frase = entonação de pergunta

**Exemplo Completo:**
\`\`\`
Olha isso aqui ↑ [pausa curta]
Eu testei por *trinta dias* [pausa curta] e não acreditei.
(sussurro) o preço é o que mais choca. [pausa longa]
(sorriso) Link na vitrine.
\`\`\`

**Erro Comum:** Empilhar ênfases em todas as palavras.
**Consequência:** Locução histérica, tom de telemarketing, queda de credibilidade.
**Forma Correta:** No máximo duas ênfases por 15 segundos de áudio.

**Exercício:** Marque prosodicamente seu roteiro do Bloco 3.
**Critério de Conclusão:** Roteiro com pausas e ênfases controladas dentro do limite.

---

## BLOCO 5 — GERAÇÃO DE VOZ: PARÂMETROS QUE IMPORTAM

**Explicação Conceitual:**
Independente da ferramenta, quatro controles determinam o resultado: **estabilidade**, **similaridade**, **estilo/exagero** e **velocidade**. Entender o trade-off entre eles é o que separa amador de profissional.

**Mapa de decisão:**
| Objetivo | Estabilidade | Estilo | Resultado |
|---|---|---|---|
| Locução institucional | alta | baixo | previsível, sem emoção |
| Review de produto | média | médio | natural e vendedor |
| Reação/entusiasmo | baixa | alto | vivo, mas com risco de artefato |
| Narração longa | alta | baixo | consistente em 60s+ |

**Aplicação Prática:**
Para TikTok Shop, o ponto ótimo quase sempre é **estabilidade média, estilo médio**. Estabilidade alta soa corporativa; estabilidade baixa gera variação de timbre entre trechos.

**Erro Comum:** Puxar estilo ao máximo buscando emoção.
**Consequência:** Estalos, respiração fantasma e mudança de identidade no meio da frase.
**Forma Correta:** Elevar estilo em incrementos pequenos e testar sempre o mesmo roteiro de controle.

**Exercício:** Gere a mesma frase em três configurações e escolha a vencedora por escuta cega.
**Critério de Conclusão:** Configuração definitiva registrada na VOICE-MASTER.

---

## BLOCO 6 — TRATAMENTO DE ÁUDIO (O QUE NINGUÉM FAZ E MUDA TUDO)

**Explicação Conceitual:**
Áudio de IA sai "limpo demais". Ambientes reais têm corpo. Um leve tratamento aproxima o áudio sintético da captação real.

**Cadeia de tratamento em 5 etapas:**
1. **Corte de silêncios** excessivos no início e fim.
2. **Filtro passa-alta** em 80Hz (remove zumbido inexistente na fala).
3. **Compressão leve** (ratio 2:1) para uniformizar picos.
4. **Ambiência mínima** (reverb de sala pequena, 5% a 8% de mix).
5. **Normalização** para -14 LUFS, pico máximo em -1 dBTP.

**Exemplo Completo:**
Locução de 14 segundos → corte de 0,4s de silêncio → passa-alta 80Hz → compressão 2:1 com 3dB de redução → reverb de sala 6% → normalização -14 LUFS. Resultado: voz encorpada, sem clipping, compatível com o loudness do TikTok.

**Erro Comum:** Aplicar reverb pesado para "dar realismo".
**Consequência:** Voz parece vinda de um banheiro; lip-sync perde precisão percebida.
**Forma Correta:** Ambiência sutil, sempre abaixo de 10% de mix.

**Exercício:** Documente sua cadeia de tratamento em preset reutilizável.
**Critério de Conclusão:** Preset salvo e aplicado de forma idêntica em todos os áudios.

---

## BLOCO 7 — LIP-SYNC: COMO A SINCRONIZAÇÃO REALMENTE FUNCIONA

**Explicação Conceitual:**
Lip-sync não é "boca abrindo". É correspondência entre fonemas e **visemas** — as formas visuais da boca. Português brasileiro concentra visemas críticos em vogais abertas (A, É, Ó) e bilabiais (P, B, M). Se essas duas famílias falham, o cérebro identifica dublagem.

**Aplicação Prática:**
Priorize roteiros com abertura vocálica clara nos primeiros 3 segundos. Evite iniciar com sequências de sibilantes ("Se estiver sem espaço...") — a boca quase não se move e a cena parece congelada.

**Exemplo Completo:**
Ruim: "Sem sujeira, sem stress, só sucesso."
Bom: "Olha o *tamanho* dessa bagunça. Acabou."

**Erro Comum:** Gerar vídeo primeiro e áudio depois.
**Consequência:** Duração incompatível, corte de sílaba final, boca parada no fim do clipe.
**Forma Correta:** **Áudio primeiro, sempre.** O áudio define a duração da cena.

**Exercício:** Reescreva um roteiro trocando sibilantes iniciais por vogais abertas.
**Critério de Conclusão:** Roteiro com abertura vocálica dominante nos primeiros 3 segundos.

---

## BLOCO 8 — PIPELINE OFICIAL DE PRODUÇÃO ÁUDIO-VÍDEO

**Explicação Conceitual:**
Escala exige ordem fixa. Qualquer inversão de etapa gera retrabalho.

**Pipeline FCIA de 9 etapas:**
1. Roteiro escrito.
2. Oralização.
3. Marcação prosódica.
4. Geração de voz (VOICE-MASTER).
5. Tratamento de áudio (preset).
6. Medição de duração exata por cena.
7. Geração/seleção do clipe de vídeo com duração compatível.
8. Aplicação de lip-sync.
9. Controle de qualidade (Bloco 10) e arquivamento.

**Exemplo Completo:**
Vídeo de 18s → áudio final 17,6s → 3 cenas (6s + 7s + 4,6s) → clipes gerados com margem de 0,5s cada → lip-sync aplicado por cena → montagem → QA → arquivo VID-007-A.

**Erro Comum:** Aplicar lip-sync em clipe mais curto que o áudio.
**Consequência:** Corte abrupto da última palavra, quebra total de credibilidade no CTA.
**Forma Correta:** Sempre gerar clipe com 0,5s de margem além do áudio.

**Exercício:** Execute a pipeline completa em um vídeo de 15 segundos.
**Critério de Conclusão:** Vídeo entregue sem retrabalho de etapa anterior.

---

## BLOCO 9 — 20 PROMPTS DE IA PARA IA (VOZ E LIP-SYNC)

Use estes prompts em qualquer assistente de texto para gerar insumos de áudio. Substitua os campos entre chaves.

1. "Atue como diretor de voz. Crie a ficha VOICE-MASTER completa (10 campos) para um influenciador virtual do nicho {nicho}, público {público}, tom {tom}."
2. "Oralize o texto abaixo em frases de no máximo 12 palavras, uma ideia por respiração, mantendo o benefício principal: {texto}."
3. "Reescreva este roteiro priorizando vogais abertas nos 3 primeiros segundos para melhorar lip-sync: {roteiro}."
4. "Aplique marcação prosódica usando [pausa curta], [pausa longa], *ênfase*, (sussurro), (sorriso) no roteiro: {roteiro}."
5. "Gere 5 variações de gancho falado de 3 segundos para o produto {produto}, todas iniciando com vogal aberta."
6. "Crie a assinatura de abertura e de fechamento faladas (3 a 5 palavras cada) para o canal {canal}."
7. "Estime a duração em segundos deste roteiro falado a 155 palavras por minuto e sugira cortes se passar de {limite}s: {roteiro}."
8. "Divida este áudio de {duração}s em 3 cenas com duração exata e descreva o plano de câmera de cada uma: {roteiro}."
9. "Liste as 10 palavras deste roteiro com pior desempenho de visema e proponha substitutas: {roteiro}."
10. "Crie um roteiro de 15s em que o CTA final caiba em 2,5 segundos falados para o produto {produto}."
11. "Atue como engenheiro de áudio. Monte a cadeia de tratamento para locução sintética destinada a TikTok, alvo -14 LUFS, justificando cada etapa."
12. "Aponte sinais de artificialidade neste roteiro falado e corrija: {roteiro}."
13. "Adapte este roteiro para tom (sussurro) confidencial mantendo clareza de dicção: {roteiro}."
14. "Gere 3 versões do mesmo roteiro com energias 5, 7 e 9 de 10, para teste A/B de conversão: {roteiro}."
15. "Crie um checklist de 12 itens de QA de áudio e lip-sync para aprovação de vídeo comercial."
16. "Liste 8 causas técnicas de dessincronização labial e a correção específica de cada uma."
17. "Escreva um roteiro de 20s com 4 respirações marcadas e 2 ênfases no máximo para {produto}."
18. "Traduza este roteiro para fala natural evitando qualquer estrangeirismo e mantendo o CTA: {roteiro}."
19. "Crie uma tabela de nomenclatura de arquivos de áudio e vídeo para escala de 100 peças por mês."
20. "Audite este roteiro contra a VOICE-MASTER abaixo e liste violações: VOICE-MASTER {ficha} / ROTEIRO {roteiro}."

**Critério de Conclusão:** Ao menos 5 prompts executados com resultado arquivado.

---

## BLOCO 10 — CONTROLE DE QUALIDADE (QA DE ÁUDIO E SINCRONIA)

**Checklist obrigatório de 12 itens:**
1. Voz corresponde à VOICE-MASTER.
2. Nenhuma frase acima de 12 palavras.
3. Máximo de 2 ênfases por 15 segundos.
4. Sem estalos, cliques ou respiração fantasma.
5. Loudness em -14 LUFS, pico ≤ -1 dBTP.
6. Ambiência ≤ 10% de mix.
7. Áudio gerado antes do vídeo.
8. Clipe com margem mínima de 0,5s.
9. Bilabiais (P, B, M) visualmente corretas.
10. Última palavra do CTA completa, sem corte.
11. Sem variação de timbre entre cenas.
12. Arquivo nomeado e arquivado no padrão.

**Regra de aprovação:** reprovação em qualquer item de 1 a 10 bloqueia publicação. Itens 11 e 12 bloqueiam arquivamento.

**Exercício:** Aplique o checklist em um vídeo já produzido e registre as reprovações.
**Critério de Conclusão:** Vídeo com 12/12 aprovado.

---

## BLOCO 11 — ERROS FATAIS E DIAGNÓSTICO RÁPIDO

| Sintoma | Causa provável | Correção |
|---|---|---|
| "Parece dublado" | visemas bilabiais errados | reescrever palavras críticas |
| Voz muda no meio | estabilidade baixa demais | subir estabilidade e regerar inteiro |
| Fim cortado | clipe menor que áudio | regerar clipe com margem |
| Tom de telemarketing | excesso de ênfase | reduzir para 2 ênfases |
| Voz "sem corpo" | falta de tratamento | aplicar preset completo |
| Áudio baixo no feed | loudness fora do padrão | normalizar a -14 LUFS |
| Boca parada no início | abertura sibilante | trocar por vogal aberta |
| Identidade irreconhecível | troca de voz entre vídeos | congelar VOICE-MASTER |

**Critério de Conclusão:** Tabela de diagnóstico dominada e usada como referência de correção.

---

## BLOCO 12 — MODO PROVA: ENTREGA DO MÓDULO

**Tarefa obrigatória:**
1. Documente sua VOICE-MASTER-01 completa (10 campos).
2. Produza um roteiro falado de 15 a 20 segundos, oralizado e com marcação prosódica.
3. Gere e trate o áudio conforme o preset de 5 etapas.
4. Meça a duração exata e divida em 3 cenas.
5. Aplique lip-sync respeitando a margem de 0,5s.
6. Rode o checklist de 12 itens e registre o resultado.

**Entregável:** 1 vídeo de 15–20s aprovado em 12/12, com áudio mestre e ficha de voz arquivados.

**Autoavaliação final:**
- Consigo reproduzir a mesma voz em 30 vídeos consecutivos? 
- Meu CTA falado sempre termina completo? 
- Sei diagnosticar dessincronia em menos de 1 minuto? 

**Critério de Conclusão do Módulo 7:** entregável aprovado, VOICE-MASTER congelada e pipeline de 9 etapas executada sem retrabalho.
`.trim();

export const complementaryM7 = `
## Recursos Complementares — Módulo 7

- **Ficha VOICE-MASTER (modelo):** 10 campos obrigatórios, versionada como VOICE-MASTER-01.
- **Preset de tratamento:** passa-alta 80Hz → compressão 2:1 → ambiência 6% → -14 LUFS / -1 dBTP.
- **Tabela de visemas críticos do português:** vogais abertas (A, É, Ó) e bilabiais (P, B, M).
- **Nomenclatura de arquivos:** \`AUD-{n}-{versão}.wav\` e \`VID-{n}-{versão}.mp4\`.
- **Regra de ouro:** áudio primeiro, vídeo depois, sempre com 0,5s de margem.
`.trim();

export const quizM7 = [
  {
    question: "Qual é a ordem correta na pipeline de produção do Módulo 7?",
    options: ["Vídeo primeiro, áudio depois", "Áudio primeiro, vídeo depois", "Lip-sync primeiro, roteiro depois", "Tratamento primeiro, roteiro depois"],
    correct_answer: "Áudio primeiro, vídeo depois",
    explanation: "O áudio define a duração exata de cada cena; o clipe é gerado com 0,5s de margem além do áudio.",
  },
  {
    question: "Qual limite de ênfases prosódicas o módulo estabelece por 15 segundos de áudio?",
    options: ["Até 2 ênfases", "Até 5 ênfases", "Uma ênfase por palavra", "Sem limite"],
    correct_answer: "Até 2 ênfases",
    explanation: "Mais de duas ênfases em 15 segundos produz tom de telemarketing e derruba credibilidade.",
  },
  {
    question: "Quais famílias de visemas são críticas para o lip-sync em português brasileiro?",
    options: ["Sibilantes e nasais finais", "Vogais abertas e bilabiais", "Ditongos e hiatos", "Consoantes surdas"],
    correct_answer: "Vogais abertas e bilabiais",
    explanation: "Vogais abertas (A, É, Ó) e bilabiais (P, B, M) são as formas visuais mais perceptíveis da boca.",
  },
  {
    question: "Qual é o alvo de loudness definido para publicação?",
    options: ["-6 LUFS", "-14 LUFS com pico ≤ -1 dBTP", "-24 LUFS", "0 dBFS"],
    correct_answer: "-14 LUFS com pico ≤ -1 dBTP",
    explanation: "É o padrão da cadeia de tratamento, compatível com o loudness do feed.",
  },
  {
    question: "Por que a VOICE-MASTER deve ser congelada?",
    options: ["Para reduzir custo de geração", "Para garantir reconhecimento auditivo e memória de marca", "Para acelerar o render", "Porque a ferramenta exige"],
    correct_answer: "Para garantir reconhecimento auditivo e memória de marca",
    explanation: "Trocar de voz entre vídeos destrói o pilar mais forte de identidade do canal.",
  },
];
