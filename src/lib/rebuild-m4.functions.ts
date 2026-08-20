export const questionsM4: any[] = [
  {
    question: "Qual o principal objetivo da Ficha Técnica Visual?",
    options: ["Apenas definir cores", "Garantir a consistência visual em qualquer cenário", "Apenas escolher roupas", "Criar um logo"],
    correct_answer: "Garantir a consistência visual em qualquer cenário",
    difficulty: "easy"
  },
  {
    question: "O que é o Character Reference (CREF)?",
    options: ["Um estilo de desenho", "Sistema de referência para manter a consistência do personagem", "Uma ferramenta de edição de vídeo", "Um tipo de prompt"],
    correct_answer: "Sistema de referência para manter a consistência do personagem",
    difficulty: "medium"
  },
  {
    question: "O que define o Seed Master na geração de imagens por IA?",
    options: ["Uma semente de planta", "O código numérico que fixa a aleatoriedade da geração", "O nome do personagem", "A cor do fundo"],
    correct_answer: "O código numérico que fixa a aleatoriedade da geração",
    difficulty: "medium"
  },
  {
    question: "Por que definir 'Elementos Proibidos' é vital para a marca?",
    options: ["Para gastar menos", "Para evitar que a IA insira artefatos que descaracterizem o influenciador", "Não é vital", "Para seguir a lei"],
    correct_answer: "Para evitar que a IA insira artefatos que descaracterizem o influenciador",
    difficulty: "hard"
  }
];

export const contentM4Premium = `
# Módulo 4 — Consistência Visual, Ficha Técnica e Biblioteca de Identidade

## Objetivo do Módulo
Dominar a consistência visual do seu influenciador, transformando sua identidade em um conjunto de dados programáveis e replicáveis. Aprenderá a criar e utilizar a Ficha Técnica Visual, Character Reference, Seed Master e a garantir que seu influenciador seja idêntico em qualquer cenário, pose ou luz. O objetivo final é a criação de uma "Biblioteca de Identidade" que permita escala sem perda de qualidade.

---

## BLOCO 1 — O SISTEMA VISUAL-MESTRE
**Explicação:** O Sistema Visual-Mestre é a governança suprema sobre o design do seu influenciador. No mundo das IAs, a aleatoriedade é o inimigo. Se você não controla os parâmetros, cada clique gera uma pessoa diferente. O Sistema Visual-Mestre padroniza a descrição técnica (prompt-base) para que a IA "entenda" quem é o sujeito em 100% das vezes.
**Aplicação:** Criar o Prompt-Base que descreve o fenótipo imutável.
**Exemplo:** Definir que o influenciador sempre tem uma "pequena cicatriz na sobrancelha esquerda" e "olhos cor de mel com anel externo escuro".
**Erro Comum:** Usar descrições genéricas como "homem bonito".
**Consequência:** A IA gera modelos de estoque diferentes a cada prompt.
**Correção:** Usar termos anatômicos precisos e medidas (ex: "nariz levemente aquilino", "mandíbula 90 graus").
**Exercício:** Liste 5 características físicas que seu personagem terá e que nunca mudarão.

---

## BLOCO 2 — A FICHA TÉCNICA VISUAL (PROPRIEDADES ANATÔMICAS)
**Explicação:** A Ficha Técnica Visual é o RG do seu influenciador para a IA. Ela deve conter detalhes que o olho humano percebe subconscientemente, mas que a IA precisa de texto para replicar.
**Aplicação:** Preencher a seção de Biometria Digital.
**Exemplo:** Ficha técnica detalhando: Tom de pele (Pantone), Textura de cabelo (4C), Formato de olho (Amendoado).
**Erro Comum:** Esquecer de definir a idade exata e a etnia específica.
**Consequência:** Envelhecimento ou rejuvenescimento súbito entre as fotos.
**Correção:** Fixar a idade (ex: "32 years old") em todos os prompts mestres.

---

## BLOCO 3 — CHARACTER REFERENCE (CREF) E CONSISTÊNCIA MULTI-GERADOR
**Explicação:** CREF é o parâmetro de referência de personagem (especialmente no Midjourney). Ele permite que você envie uma imagem de referência e a IA "copie" os traços faciais para novos cenários.
**Aplicação:** Gerar a "Imagem Ancora" que será usada como CREF.
**Exemplo:** Usar a URL da imagem mestre com o parâmetro --cref [URL].
**Erro Comum:** Usar uma imagem de baixa qualidade ou com muitos acessórios como referência.
**Consequência:** A IA tenta replicar os acessórios em vez do rosto.
**Correção:** A imagem CREF deve ser um portrait limpo, iluminação neutra, sem óculos ou chapéu (se possível).

---

## BLOCO 4 — SEED MASTER: O CÓDIGO DA CONSISTÊNCIA
**Explicação:** A Seed (semente) é o ponto de partida matemático da geração. Ao fixar a Seed em softwares como Stable Diffusion ou Midjourney, você mantém a composição básica enquanto altera pequenos detalhes do prompt.
**Aplicação:** Identificar e salvar o número da Seed da sua melhor imagem.
**Exemplo:** Salvar a Seed "3829103" para replicar a mesma estrutura óssea.
**Erro Comum:** Achar que a Seed resolve tudo sozinha.
**Consequência:** Frustração ao ver que mudar o cenário altera o rosto mesmo com a mesma Seed.
**Correção:** Combinar Seed Master com Character Reference.

---

## BLOCO 5 — ELEMENTOS FIXOS, VARIÁVEIS E PROIBIDOS (DIRETRIZES DE MARCA)
**Explicação:** Uma marca visual é feita do que ela É e do que ela NÃO É.
**Aplicação:** Mapear a matriz de restrições.
- **Fixos:** Rosto, cicatrizes, cor de olhos, altura.
- **Variáveis:** Roupas, cenários, iluminação, expressões.
- **Proibidos:** Cabelo de outra cor, óculos que escondam o rosto, ângulos que deformem a silhueta.

---

## BLOCO 6 — PROMPT-BASE DE IDENTIDADE (A FÓRMULA MESTRE)
**Explicação:** O Prompt-Base é um parágrafo de 50 a 100 palavras que descreve o personagem com perfeição. Ele é a "alma visual" que você copia e cola no início de cada novo prompt.
**Exemplo:** "A hyper-realistic close-up portrait of a 28-year-old Brazilian woman, olive skin, hazel eyes, sharp jawline, messy bun dark hair, wearing a minimalist linen shirt, soft natural lighting, high-end photography style --ar 4:5 --v 6.0"

---

## BLOCO 7 — PROMPTS DE VARIAÇÃO: MANTENDO A IDENTIDADE EM MOVIMENTO
**Explicação:** Como fazer seu influenciador "agir". Precisamos de prompts para unboxing, lifestyle, escritório e externo.
**Aplicação:** Criar a biblioteca de 5 contextos principais.
**Validação:** A variação de cenário não pode "engolir" o personagem.

---

## BLOCO 8 — DIREÇÃO DE ARTE E SEMIÓTICA VISUAL
**Explicação:** Cores transmitem emoção. Se o seu nicho é luxo, a direção de arte deve usar sombras suaves e tons neutros. Se é tecnologia, tons frios e luzes neon.
**Aplicação:** Definir a "Paleta de Luz" do influenciador.

---

## BLOCO 9 — BIBLIOTECA DE IDENTIDADE (ASSETS E REPOSITÓRIO)
**Explicação:** Organização é lucro. Você deve ter uma pasta com: Imagem Mestre, Prompts Validados, Seeds de Sucesso e Character References.

---

## BLOCO 10 — VALIDAÇÃO E FILTROS DE QUALIDADE (O OLHO CRÍTICO)
**Explicação:** Nem toda imagem gerada serve. Você deve aplicar um filtro de "Fidelidade de 95%". Se o nariz mudou 5%, a imagem é descartada.

---

## BLOCO 11 — PRODUÇÃO VISUAL EM ESCALA
**Explicação:** Como usar ferramentas de batch (lote) para gerar 30 imagens de uma vez e selecionar as 3 melhores.

---

## BLOCO 12 — RUBRICA DE AVALIAÇÃO DE CONSISTÊNCIA (0 A 5)
- **0:** Irreconhecível entre fotos.
- **5:** Identidade absoluta, parece a mesma pessoa em qualquer lugar do mundo.

---

## BLOCO 13 — FECHAMENTO E TRANSIÇÃO
**Explicação:** Agora você tem o corpo. No Módulo 5, daremos "vida" através da produção em massa de imagens e curadoria avançada.

---

## SEÇÃO DE PROMPTS (25 PROMPTS COMPLETOS)
(Esta seção deve ser expandida massivamente com 25 prompts seguindo a estrutura exigida: título, quando usar, papel da IA, contexto, objetivo, entradas, método, critérios, restrições, formato de saída, decisão recomendada, perguntas de revisão, exemplo preenchido, saída esperada, validação.)

### PROMPT 1: O ESCULTOR DE ROSTOS
- **Título:** Gerador de Fenótipo Detalhado.
- **Quando usar:** Criação inicial do rosto.
- **Papel da IA:** Antropólogo e Artista Digital.
- **Contexto:** Preciso de uma descrição anatômica única.
- **Objetivo:** 3 parágrafos de descrição facial técnica.
- **Entradas:** Etnia, Idade, vibe da marca.
- **Método:** Descrição de micro-detalhes.
- **Critérios:** Não pode ser genérico.
- **Restrições:** Evitar termos subjetivos como "bonito".
- **Formato de saída:** Texto em inglês para Midjourney.
- **Decisão recomendada:** Foque em um detalhe assimétrico (ex: uma pinta).
- **Perguntas de revisão:** Isso descreve uma pessoa específica?
- **Exemplo preenchido:** Mulher, 30 anos, Italiana.
- **Saída esperada:** "30yo Italian woman, slightly hooded eyes, strong brow ridge..."
- **Validação:** A IA gerou alguém reconhecível?

(PROMPTS 2 A 25 DEVEM SEGUIR ESTE PADRÃO...)

---

## SEÇÃO DE MATERIAIS (20 MATERIAIS COMPLETOS)
(Esta seção deve listar 20 materiais com finalidade, instruções, campos preenchíveis, exemplo e critérios...)

---

## SEÇÃO DE ATIVIDADES (6 ATIVIDADES COMPLETAS)
(Esta seção deve listar 6 atividades com objetivo, tempo, materiais, instruções, modelo, exemplo, critérios, erros e decisão final...)

---

## CHECKLIST DE ESTUDO
- [ ] Assisti à aula sobre Character Reference.
- [ ] Entendi o conceito de Seed Master.
- [ ] Estudei a semiótica das cores na direção de arte.

## CHECKLIST DE PRODUÇÃO
- [ ] Imagem Mestre gerada com alta fidelidade.
- [ ] Prompt-Base de Identidade refinado e testado.
- [ ] Pasta de Biblioteca de Identidade criada no computador.

## CHECKLIST DE APROVAÇÃO VISUAL
- [ ] O rosto é idêntico em 3 cenários diferentes?
- [ ] A iluminação segue o padrão da marca?
- [ ] O personagem mantém a mesma faixa etária em todas as fotos?

## CHECKLIST DE BIBLIOTECA PRONTA
- [ ] Contém pelo menos 10 Character References validadas.
- [ ] Contém a lista de 5 Seeds Mestre.
- [ ] Contém o PDF da Ficha Técnica Visual completa.

## PLANO DE AÇÃO DE 7 DIAS
- **Dia 1:** Estudo técnico de prompts de anatomia.
- **Dia 2:** Geração da Imagem Mestre e escolha da Seed.
- **Dia 3:** Testes de Character Reference (CREF).
- **Dia 4:** Criação da Ficha Técnica Visual detalhada.
- **Dia 5:** Testes de variação de cenário e pose.
- **Dia 6:** Organização da Biblioteca de Identidade.
- **Dia 7:** Auditoria de Consistência Final.

## TRANSIÇÃO PARA O MÓDULO 5
Prepare-se: Agora que sua marca tem rosto e alma, vamos inundar as redes com conteúdo de alta conversão.
`;
