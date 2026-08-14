export const contentM4Premium = `
# Módulo 4 — Consistência Visual, Ficha Técnica e Biblioteca de Identidade

## Objetivo do Módulo
Transformar a Ficha-Mestra de Identidade do Módulo 3 em um sistema técnico, reutilizável e controlável de consistência visual. O aluno não deve sair com imagens aleatórias, mas com uma biblioteca organizada, um prompt-base, regras de continuidade e um método para criar variações sem perder o reconhecimento do influenciador.

---

## BLOCO 1 — O QUE É CONSISTÊNCIA VISUAL
A consistência visual é a âncora de confiança do seu Influenciador Virtual (IV). Se o rosto, o corpo ou a "aura" do personagem muda a cada post, a audiência percebe a fraude e a conexão é quebrada.

### Pilares da Consistência:
- **Identidade Visual:** O conjunto de traços físicos e estéticos permanentes.
- **Continuidades:** A repetição de elementos (roupas, acessórios, cenários) que reforçam o reconhecimento.
- **Reconhecimento:** A capacidade do público identificar o IV em 0.5 segundos, mesmo em miniaturas.
- **Variação Criativa:** Mudar a pose e a ação sem mudar a essência.

**Comparação Crítica:**
- **Amador:** Imagens bonitas, mas desconectadas (cada uma parece uma pessoa diferente).
- **Profissional:** Identidade repetível (mesma estrutura óssea, tom de pele e olhar em todas as luzes).

**Erro Comum:** Acreditar que um "bom prompt" resolve tudo.
**Correção:** Usar um Sistema Visua-Mestre (Prompt-Base + Referência + Seed).

---

## BLOCO 2 — DA FICHA-MESTRA À FICHA TÉCNICA VISUAL
Vamos converter os conceitos do Módulo 3 em especificações técnicas para a IA.

### A Ficha Técnica Visual (FTV):
- **Código Interno:** Identificador único da versão do modelo.
- **Idade Aparente:** Ex: "28 anos, jovem adulto".
- **Pele:** Subtom (quente/frio), textura, sardas ou marcas.
- **Rosto:** Formato (oval, quadrado), mandíbula, queixo.
- **Olhos:** Cor exata, formato (amendoado, profundo), sobrancelhas.
- **Cabelo:** Cor, corte, textura (liso, ondulado, crespo).
- **Corpo:** Tipo físico, altura aparente, postura predominante.
- **Estética:** Paleta de cores (hex codes), iluminação (cinematográfica, natural).

**Exemplo:** Se sua IV é uma "Chef Prática", sua FTV proíbe maquiagem pesada ou unhas longas, mantendo sempre o avental de linho como elemento de reconhecimento.

---

## BLOCO 3 — CHARACTER REFERENCE (CREF)
A técnica de Character Reference é o uso de uma imagem "âncora" para guiar a IA.

### Composição da Referência Central:
1. **Retrato Frontal:** Olhando diretamente para a câmera, luz neutra.
2. **Três Quartos:** Visão levemente lateral.
3. **Perfil:** Contorno do nariz e mandíbula.
4. **Corpo Inteiro:** Proporções físicas e postura.
5. **Expressões:** Neutra, sorrindo, concentrada.

**Importante:** A referência reduz a variação, mas não substitui o prompt. A IA precisa ler a descrição para entender o que manter da imagem.

---

## BLOCO 4 — SEED MASTER E CONTROLE DE VARIAÇÃO
O "Seed" (Semente) é o número que define o ruído inicial da imagem.

- **Seed Master:** O registro do número da imagem perfeita que servirá de base.
- **Limitações:** O seed raramente funciona entre ferramentas diferentes (Midjourney vs. Stable Diffusion).
- **Registro Operacional:** Mantenha uma tabela com [Data | Ferramenta | Modelo | Prompt | Seed | Resultado].

**Dica:** Se a ferramenta não permite fixar o seed, foque na **Ancoragem de Prompt** (repetir o bloco de identidade em 100% das gerações).

---

## BLOCO 5 — ELEMENTOS FIXOS, VARIÁVEIS E PROIBIDOS

| Categoria | Exemplos |
| :--- | :--- |
| **FIXOS (100% de repetição)** | Estrutura óssea, cor dos olhos, tom de pele, marcas de nascença, paleta principal. |
| **VARIÁVEIS (Contextuais)** | Roupas (dentro do estilo), poses, expressões, cenários, iluminação, acessórios de ação. |
| **PROIBIDOS (Quebra de Marca)** | Mudar cor do cabelo sem aviso, trocar gênero, usar roupas fora do arquétipo, deformações anatômicas. |

---

## BLOCO 6 — PROMPT-BASE DE IDENTIDADE
O prompt-base é a sua "assinatura digital". Ele deve ser estruturado em blocos:

1. **Âncora de Identidade:** "A 28-year-old Brazilian woman, oval face, hazel eyes..."
2. **Ação:** "...holding a smartphone and smiling..."
3. **Ambiente:** "...in a bright modern kitchen..."
4. **Câmera/Luz:** "85mm lens, cinematic lighting, soft shadows..."
5. **Estética:** "photorealistic, 8k, highly detailed skin texture..."
6. **Guardas Negativas:** "--no blurry, distorted, double heads..."

---

## BLOCO 7 — PROMPTS DE VARIAÇÃO CONTROLADA
Como adaptar o IV para diferentes situações:

- **Unboxing:** Foco nas mãos e expressão de surpresa, mantendo o rosto fixo.
- **Tutorial:** Plano médio (waist-up), postura didática, ambiente de trabalho.
- **Lifestyle:** Fundo com profundidade de campo (bokeh), luz natural, roupa casual.

**Exercício:** Tente gerar seu personagem em 3 ambientes diferentes usando o mesmo Prompt-Base.

---

## BLOCO 8 — A BIBLIOTECA DE IDENTIDADE E REFERÊNCIAS
Organize seus ativos. Um influenciador de sucesso tem centenas de imagens prontas antes mesmo do primeiro post.

- **Pastas por Contexto:** [Rostos], [Corpo Inteiro], [Cenários], [Acessórios].
- **Versão:** Guarde as versões 1.0, 2.0 (evoluções sutis são permitidas, mudanças bruscas não).

---

## BLOCO 9 — DETECÇÃO DE INCONSISTÊNCIAS E ERROS COMUNS
Aprenda a fazer a curadoria fria.

**15 Erros Comuns:**
1. Rosto que estica em poses de perfil.
2. Cor dos olhos que muda conforme a luz.
3. Roupas que não cabem no personagem.
4. Cenários excessivamente fantásticos para um IV realista.
5. Mãos com 6 dedos (clássico, mas ainda letal).

**Ação:** Se a imagem tem 90% de acerto mas o olho está errado, ela é descartada ou corrigida via Inpainting.

---

## BLOCO 10 — PROJETO PREENCHÍVEL: SISTEMA VISUAL-MESTRE
Crie o documento técnico que será a fonte para o Módulo 5.

**Inclua:**
- Prompt-Base definitivo.
- Tabela de Elementos Fixos/Variáveis.
- Link para a Imagem de Referência (CREF).

---

## BLOCO 11 — CHECKPOINT VERIFICÁVEL E RUBRICA
Antes de avançar, valide:
- [ ] O rosto é reconhecível em 3 poses diferentes?
- [ ] O prompt-base gera resultados consistentes em 5 tentativas seguidas?
- [ ] A paleta de cores está sendo respeitada?

---

## BLOCO 12 — PLANO DE AÇÃO DE 7 DIAS E TRANSIÇÃO
- **Dia 1-2:** Refinar a Ficha Técnica Visual.
- **Dia 3-4:** Testar o Prompt-Base exaustivamente.
- **Dia 5-6:** Criar a Biblioteca Inicial de 20 imagens.
- **Dia 7:** Aprovação final do Sistema Visual-Mestre.

**Fechamento:** Você agora domina a técnica da consistência. Você não cria mais imagens aleatórias; você opera um sistema de identidade. No Módulo 5, usaremos este sistema para a **Produção de Ativos em Escala**.
`.trim();

export const questionsM4 = [
  {
    question: "O que é um 'Seed Master' no contexto de influenciadores virtuais?",
    options: ["Um número de registro que define o ruído inicial e ajuda na consistência", "O nome do primeiro seguidor do influenciador", "A senha de acesso ao gerador de imagens", "Uma técnica de edição de vídeo"],
    correct_answer: "Um número de registro que define o ruído inicial e ajuda na consistência",
    difficulty: "medium"
  },
  {
    question: "Qual a função do 'Character Reference' (--cref)?",
    options: ["Usar uma imagem âncora para manter a estabilidade visual do personagem", "Mudar o cenário da imagem", "Aumentar a resolução da foto", "Remover o fundo da imagem"],
    correct_answer: "Usar uma imagem âncora para manter a estabilidade visual do personagem",
    difficulty: "medium"
  },
  {
    question: "Por que devemos definir 'Elementos Proibidos' na ficha técnica?",
    options: ["Para evitar desvios de marca e quebras de reconhecimento", "Para economizar créditos na IA", "Para acelerar o tempo de geração", "Não é necessário definir"],
    correct_answer: "Para evitar desvios de marca e quebras de reconhecimento",
    difficulty: "hard"
  }
];
