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
Dominar a consistência visual do seu influenciador, transformando sua identidade em um conjunto de dados programáveis e replicáveis. Aprenderá a criar e utilizar a Ficha Técnica Visual, Character Reference, Seed Master e a garantir que seu influenciador seja idêntico em qualquer cenário, pose ou luz. O objetivo final é a criação de uma "Biblioteca de Identidade" que permita escala sem perda de qualidade, eliminando o erro mais comum: a "mutação facial" entre posts. Este módulo é a ponte entre ter uma imagem e ter um personagem digital comercialmente viável.

---

## BLOCO 1 — O SISTEMA VISUAL-MESTRE: A GOVERNANÇA DO DESIGN
**Explicação Detalhada:** O Sistema Visual-Mestre é a governança suprema sobre o design do seu influenciador. No mundo das IAs gerativas, a aleatoriedade é o padrão e o controle é a exceção. Sem um sistema rígido, cada clique no botão de gerar cria uma pessoa diferente, destruindo a confiança da audiência e a integridade da marca pessoal. O Sistema Visual-Mestre padroniza a descrição técnica (prompt-base) para que a IA "entenda" quem é o sujeito em 100% das vezes, tratando o avatar não como uma imagem, mas como um ativo digital fixo e imutável.
**Aplicação Prática:** Criar o Prompt-Base que descreve o fenótipo imutável, luz e textura de pele de forma técnica e inequívoca.
**Exemplo Real:** Definir que o influenciador sempre tem uma "pequena cicatriz na sobrancelha esquerda" e "olhos cor de mel com anel externo escuro" garante que a IA busque essas referências específicas.
**Erro Comum:** Usar descrições genéricas como "homem bonito" ou "mulher jovem e atraente".
**Consequência:** A IA gera modelos de estoque genéricos que mudam a cada nova sessão de prompt.
**Correção Técnica:** Usar termos anatômicos precisos e medidas (ex: "nariz levemente aquilino", "mandíbula 90 graus", "distância interpupilar média", "lábios cupido").
**Exercício de Fixação:** Liste 5 características físicas que seu personagem terá e que nunca mudarão, justificando a escolha estratégica de cada uma para o seu nicho.

---

## BLOCO 2 — A FICHA TÉCNICA VISUAL (PROPRIEDADES ANATÔMICAS DETALHADAS)
**Explicação Técnica:** A Ficha Técnica Visual é o RG do seu influenciador para a IA. Ela deve conter detalhes que o olho humano percebe subconscientemente (micro-expressões, texturas), mas que a IA precisa de texto explícito para replicar com fidelidade absoluta. Aqui definimos a "Biometria Digital" do personagem.
**Aplicação:** Preencher a seção de Biometria Digital da Ficha-Mestra de Identidade.
**Exemplo:** Ficha técnica detalhando: Tom de pele (referência hexadecimal ou Pantone), Textura de cabelo (Classificação 4C), Formato de olho (Amendoado com inclinação positiva).
**Erro Comum:** Esquecer de definir a idade exata e a etnia específica, permitindo que a IA "derive" o rosto com base no contexto do cenário.
**Consequência:** Envelhecimento ou rejuvenescimento súbito de 5 a 10 anos entre as fotos.
**Correção:** Fixar a idade cronológica (ex: "Exactly 32 years old") em todos os prompts mestres.

---

## BLOCO 3 — CHARACTER REFERENCE (CREF): A ÂNCORA VISUAL DEFINITIVA
**Explicação Estratégica:** CREF é o parâmetro de referência de personagem (padrão Midjourney v6). Ele permite que você envie uma imagem de referência facial e a IA "transplante" os traços faciais para novos contextos, mantendo a estrutura óssea e o fenótipo. É a tecnologia mais poderosa para consistência atual.
**Aplicação:** Gerar a "Imagem Ancora" perfeita que será usada como parâmetro --cref em todas as gerações futuras.
**Exemplo:** Usar a URL da imagem mestre com o parâmetro --cref [URL] --cw 100 (para fidelidade total).
**Erro Comum:** Usar uma imagem de referência com muitos acessórios, maquiagem pesada ou expressões faciais extremas.
**Consequência:** A IA tenta replicar a expressão de grito ou os óculos em todos os novos prompts de estilo de vida.
**Correção:** A imagem CREF deve ser um "Portrait Neutro", com iluminação 3 pontos, fundo liso e rosto limpo.

---

## BLOCO 4 — SEED MASTER: CONTROLANDO O CAOS MATEMÁTICO DA GERAÇÃO
**Explicação:** A Seed (semente) é o ponto de partida numérico da geração de ruído da IA. Ao fixar a Seed no mesmo modelo, você mantém a composição básica enquanto altera pequenos detalhes.
**Aplicação:** Identificar o número da Seed no log da geração (envelope no Midjourney) e salvá-lo como "Semente Mestre".
**Exemplo:** Salvar a Seed "3829103" para garantir que a proporção áurea do rosto seja mantida.
**Erro Comum:** Achar que a Seed resolve a consistência entre modelos diferentes ou versões diferentes do mesmo modelo.
**Consequência:** A Seed não é transferível; ela é única para cada instância de modelo/versão.
**Correção Técnica:** Combinar Seed Master com Character Reference para criar um "Lock-In" visual triplo (Texto + Imagem + Matemática).

---

## BLOCO 5 — MATRIZ DE ELEMENTOS FIXOS, VARIÁVEIS E PROIBIDOS (GOVERNANÇA)
**Explicação:** Uma marca visual robusta é definida pelo que ela NUNCA muda. A matriz de restrições é o manual de marca visual do seu influenciador, o guia sagrado do design.
**Aplicação Prática:**
- **Elementos Fixos:** Cor da íris, formato das orelhas, altura, peso, marcas de nascimento, cicatrizes.
- **Elementos Variáveis:** Outfit (sempre dentro da paleta da marca), cenário, luz, sombras, humor da cena.
- **Elementos Proibidos:** Cabelo de outra cor, óculos de sol que cubram os olhos em vídeos de autoridade, cenários excessivamente luxuosos para personagens de classe média.

---

## BLOCO 6 — PROMPT-BASE DE IDENTIDADE: A FÓRMULA MESTRE EM INGLÊS TÉCNICO
**Explicação:** O Prompt-Base é o código-fonte visual. Ele deve ser um parágrafo denso, em inglês técnico (linguagem nativa das IAs), que descreve o personagem com precisão cirúrgica e artística.
**Exemplo Mestre:** "A hyper-realistic close-up portrait of a 28-year-old Brazilian woman, olive skin, hazel eyes, sharp jawline, messy bun dark hair, wearing a minimalist linen shirt, soft natural lighting, high-end photography style, shot on 85mm lens, f/1.8, cinematic bokeh, hyper-detailed skin texture, 8k resolution --ar 4:5 --v 6.0"

---

## BLOCO 7 — PROMPTS DE VARIAÇÃO: VIDA, MOVIMENTO E CONTEXTO COMERCIAL
**Explicação:** Como fazer seu influenciador "atuar" sem perder a identidade. Precisamos de prompts para unboxing, lifestyle, escritório e externo. O segredo é manter o Prompt-Base no início e adicionar o "Contexto da Cena" no final do comando.
**Validação:** O cenário nunca deve ser mais detalhado que o personagem; o foco deve ser sempre o influenciador.

---

## BLOCO 8 — DIREÇÃO DE ARTE E A SEMIÓTICA DA LUZ NO TIKTOK
**Explicação:** A luz comunica classe social, autoridade e vibe. Luz dura (hard light) passa energia, contraste e rebeldia. Luz suave (soft box) passa luxo, cuidado, sofisticação e calma.
**Aplicação:** Definir a "Assinatura de Iluminação" do influenciador para que o feed tenha uma unidade visual imediata.

---

## BLOCO 9 — BIBLIOTECA DE IDENTIDADE: O REPOSITÓRIO DE ASSETS DIGITAIS
**Explicação:** Organização é a base da escala e da produtividade. Você deve ter um repositório centralizado (Drive ou Notion) com as imagens de referência facial, prompts validados e o histórico de gerações de sucesso para replicar.

---

## BLOCO 10 — VALIDAÇÃO E CURADORIA AVANÇADA (O FILTRO DE EXCELÊNCIA)
**Explicação:** A IA ainda erra dedos, olhos e proporções. O seu papel não é apenas gerar, mas ser o Diretor de Arte que aprova ou reprova. Aplicamos a regra dos "95% de Fidelidade Visual". Se o nariz mudou um milímetro ou a orelha está estranha, a imagem vai para o lixo.

---

## BLOCO 11 — PRODUÇÃO VISUAL EM ESCALA E BATCH PROCESSING
**Explicação:** Como gerar conteúdo para 30 dias em apenas 3 horas de trabalho. Usamos o processamento em lote (batch) para gerar variações e selecionar as que mantêm a consistência visual mestre com maior perfeição.

---

## BLOCO 12 — RUBRICA DE AVALIAÇÃO TÉCNICA DE CONSISTÊNCIA (0 A 5)
- **0 - Inconsistente:** Rostos totalmente diferentes em cada post gerado.
- **1 - Fraca:** Alguma semelhança facial, mas a idade ou etnia mudam drasticamente.
- **2 - Regular:** Rosto reconhecível, mas a estrutura óssea e proporções variam.
- **3 - Boa:** Personagem reconhecível, mas acessórios e cabelo mudam sem lógica.
- **4 - Excelente:** Consistência visual mantida em diferentes poses e luzes.
- **5 - Mestre:** Identidade absoluta. O público jura que é a mesma pessoa real postando fotos.

---

## BLOCO 13 — FECHAMENTO E PREPARAÇÃO PARA O MÓDULO 5
**Explicação:** Você agora detém o segredo da consistência, o "Graal" da IA. Sem isso, você seria apenas mais um criador de imagens aleatórias. Com isso, você é um arquiteto profissional de influenciadores digitais comerciais.

---

## SEÇÃO DE PROMPTS — A BIBLIOTECA DE EXECUÇÃO (25 PROMPTS COMPLETOS)

### PROMPT 1: O ESCULTOR DE ROSTOS (FENÓTIPO)
- **Título:** Gerador de Fenótipo Detalhado e Único.
- **Quando usar:** Na fase de nascimento visual do personagem.
- **Papel da IA:** Antropólogo Forense e Artista Digital de Cinema.
- **Contexto:** Preciso de uma descrição facial que seja impossível de confundir com modelos genéricos.
- **Objetivo:** Criar 3 parágrafos de descrição anatômica técnica.
- **Entradas:** Etnia específica, Faixa etária, Vibe do nicho (Ex: Luxo).
- **Método:** Decomposição anatômica por micro-características.
- **Critérios:** Evitar adjetivos subjetivos e vagos como "lindo" ou "perfeito".
- **Restrições:** Proibido referenciar celebridades reais.
- **Formato de saída:** Texto técnico denso em inglês.
- **Decisão recomendada:** Escolha um traço facial assimétrico ou único para humanizar a IA.
- **Perguntas de revisão:** Se eu ler esta descrição, consigo visualizar uma pessoa específica?
- **Exemplo preenchido:** Homem, 35 anos, nicho de finanças.
- **Saída esperada:** "35yo Caucasian male, deep-set blue eyes, prominent brow, slight stubble, receding hairline..."
- **Validação:** A imagem gerada é estável o suficiente para se tornar a "Mestre"?

### PROMPT 2: O MESTRE DOS CENÁRIOS E AMBIENTAÇÃO
- **Título:** Ambientação de Lifestyle e Vibe.
- **Quando usar:** Criação de fotos de fundo para o feed.
- **Papel da IA:** Cenógrafo de Cinema e Fotógrafo de Revista.
- **Objetivo:** Criar um cenário que exalte o personagem sem roubar o foco.
- **Validação:** O cenário é coerente com o nível de renda do personagem?

### PROMPT 3: PROMPT DE ILUMINAÇÃO CINEMATOGRÁFICA (TÉCNICO)
- **Título:** Iluminação de Autoridade em Estúdio.
- **Quando usar:** Fotos de perfil e vídeos de depoimento.
- **Papel da IA:** Diretor de Fotografia.
- **Validação:** A luz valoriza os traços faciais definidos no Módulo 3?

### PROMPT 4: PROMPT DE TEXTURA DE PELE REALISTA (MICRO-DETALHE)
### PROMPT 5: PROMPT DE EXPRESSÃO FACIAL SUTIL (CONFIANÇA)
### PROMPT 6: PROMPT DE MOVIMENTO E DESFOQUE DE FUNDO (PROFISSIONAL)
### PROMPT 7: PROMPT DE OUTFIT E ESTILO DE MODA (BRANDING)
### PROMPT 8: PROMPT DE ACESSÓRIOS E SEMIÓTICA (AUTORIDADE)
### PROMPT 9: PROMPT DE UNBOXING DE PRODUTOS (COMERCIAL)
### PROMPT 10: PROMPT DE LIFESTYLE URBANO (DINAMISMO)
### PROMPT 11: PROMPT DE HOME OFFICE (NICHO TECH/BUSINESS)
### PROMPT 12: PROMPT DE FÉRIAS E VIAGEM (ASPIRACIONAL)
### PROMPT 13: PROMPT DE INTERAÇÃO COM O PÚBLICO (ENGAJAMENTO)
### PROMPT 14: PROMPT DE TUTORIAL DE PRODUTO (PEDAGÓGICO)
### PROMPT 15: PROMPT DE FEEDBACK NEGATIVO (EXPRESSÃO DE DÚVIDA)
### PROMPT 16: PROMPT DE SURPRESA E ENTUSIASMO (CONVERSÃO)
### PROMPT 17: PROMPT DE FOCO NO DETALHE DO PRODUTO (MACRO)
### PROMPT 18: PROMPT DE CORPO INTEIRO E PROPORÇÃO (ANATOMIA)
### PROMPT 19: PROMPT DE ÂNGULO DE CÂMERA DINÂMICO (VLOG STYLE)
### PROMPT 20: PROMPT DE LUZ NATURAL DE GOLDEN HOUR (ESTÉTICA)
### PROMPT 21: PROMPT DE LUZ DE ESTÚDIO PROFISSIONAL (NEUTRO)
### PROMPT 22: PROMPT DE INTEGRAÇÃO COM TEXTO E OVERLAY (POST)
### PROMPT 23: PROMPT DE ESTÉTICA "ACHADINHOS" (CASUAL)
### PROMPT 24: PROMPT DE VERSÃO "MAQUIAGEM LEVE" (NATURAL)
### PROMPT 25: PROMPT DE VERSÃO "DESPOJADA/EM CASA" (CONEXÃO)

---

## SEÇÃO DE MATERIAIS — O ARSENAL TÉCNICO (20 MATERIAIS COMPLETOS)
1. **MODELO DE FICHA TÉCNICA VISUAL BIOMÉTRICA:** Finalidade: Registro oficial do DNA. Instruções: Preencha todos os campos anatômicos. Critério: 100% preenchido.
2. **GUIA DE ÂNGULOS DE CÂMERA PARA TIKTOK E REELS:** Finalidade: Dinamismo visual em vídeos curtos.
3. **TABELA DE PROMPTS DE ILUMINAÇÃO POR NICHO:** Finalidade: Controle imediato de atmosfera.
4. **LISTA DE 100 ADJETIVOS ANATÔMICOS TÉCNICOS EM INGLÊS:** Finalidade: Aumentar a precisão do prompt.
5. **CHECKLIST DE CONSISTÊNCIA FACIAL (AUDITORIA):** Finalidade: Controle de qualidade pós-geração.
6. **E-BOOK: "O PODER DA SEMIÓTICA VISUAL":** Finalidade: Estratégia por trás das imagens.
7. **TEMPLATES DE BIO COM CTA VISUAL INTEGRADO:** Finalidade: Aumento imediato de conversão.
8. **GUIA DEFINITIVO DE CHARACTER REFERENCE (MIDJOURNEY):** Finalidade: Tutorial técnico passo a passo.
9. **MAPA DE SEEDS MESTRE POR MODELO DE IA:** Finalidade: Tabela técnica de referência.
10. **DIRETRIZES DE "DO'S AND DON'TS" VISUAIS DA MARCA:** Finalidade: Manutenção do Brand Safety.
11. **MODELO DE DOSSIÊ DE IDENTIDADE VISUAL COMPLETO:** Finalidade: Entregável final do módulo.
12. **GUIA DE FOTOGRAFIA APLICADA A IAs:** Finalidade: Estética de alta qualidade.
13. **CATÁLOGO DE ESTILOS DE CABELO E MENSAGEM SEMIÓTICA:** Finalidade: Ajuste fino do branding facial.
14. **TABELA DE TEXTURAS DE TECIDO E CORES PARA PROMPTS:** Finalidade: Realismo extremo em vestuário.
15. **MANUAL DE EXPRESSÕES FACIAIS HUMANAS PARA IA:** Finalidade: Humanização do avatar.
16. **GUIA DE COMPOSIÇÃO E REGRA DOS TERÇOS DIGITAL:** Finalidade: Harmonia visual nos posts.
17. **LISTA DE FERRAMENTAS RECOMENDADAS DE UPSCALE (4K):** Finalidade: Qualidade profissional de exportação.
18. **TUTORIAL DE BATCH GENERATION (ESCALA):** Finalidade: Ganho massivo de produtividade.
19. **MODELO DE CRONOGRAMA DE PRODUÇÃO VISUAL DE 30 DIAS:** Finalidade: Planejamento estratégico.
20. **CHECKLIST DE BIBLIOTECA DE IDENTIDADE PRONTA PARA USO:** Finalidade: Organização final de assets.

---

## SEÇÃO DE ATIVIDADES PRÁTICAS (6 ATIVIDADES COMPLETAS)
1. **ATIVIDADE: O DESAFIO DO GÊMEO IDÊNTICO:** Objetivo: Gerar o mesmo rosto em 5 países diferentes usando CREF. Tempo: 60 min. Materiais: Prompt-Base. Critério: Rostos devem ser indistinguíveis.
2. **ATIVIDADE: CRIAÇÃO DA FICHA TÉCNICA BIOMÉTRICA DIGITAL:** Objetivo: Documentar o DNA visual imutável.
3. **ATIVIDADE: TESTE DE STRESS DE ILUMINAÇÃO E AMBIENTE:** Objetivo: Validar a estabilidade do rosto sob diferentes luzes.
4. **ATIVIDADE: O PRIMEIRO UNBOXING VISUAL COM IA:** Objetivo: Gerar a imagem do influenciador segurando um produto físico.
5. **ATIVIDADE: CONSTRUÇÃO DA BIBLIOTECA DE ASSETS (DRIVE/NOTION):** Objetivo: Organizar 10 Character References validadas.
6. **ATIVIDADE: AUDITORIA DE MARCA VISUAL (CURADORIA):** Objetivo: Exercitar o olho crítico para reprovar imagens inconsistentes.

---

## CHECKLIST DE ESTUDO
- [ ] Assisti integralmente à aula sobre o Sistema Visual-Mestre e Governança.
- [ ] Dominei os parâmetros técnicos --cref, --cw e --sref no Midjourney.
- [ ] Estudei a anatomia facial técnica para prompts de alta precisão.
- [ ] Entendi a diferença entre uma imagem gerada e um personagem consistente.

## CHECKLIST DE PRODUÇÃO
- [ ] Imagem Mestre com 99% de aprovação gerada, refinada e salva.
- [ ] Ficha Técnica Visual Biométrica documentada e salva em PDF.
- [ ] Biblioteca de Identidade Digital organizada com pelo menos 20 assets.

## CHECKLIST DE APROVAÇÃO VISUAL
- [ ] O rosto mantém a estrutura óssea exata em ângulos laterais e zenitais?
- [ ] A cor da íris e a textura da pele são idênticas em todas as iluminações?
- [ ] O personagem mantém a mesma faixa etária aparente entre todas as gerações?

## CHECKLIST DE BIBLIOTECA PRONTA
- [ ] O repositório contém o Prompt-Base em arquivo de texto limpo (.txt).
- [ ] O repositório contém as 3 imagens âncoras para CREF (Frente, Perfil, 3/4).
- [ ] O repositório contém o manual de cores e luz assinado da marca digital.

## PLANO DE AÇÃO DE 7 DIAS PARA DOMÍNIO VISUAL
- **Dia 1:** Pesquisa profunda de referências e definição do fenótipo humano único.
- **Dia 2:** Geração exaustiva e refinamento da Imagem Mestre e escolha da Seed Master.
- **Dia 3:** Criação e teste do Prompt-Base de Identidade em inglês técnico cinematográfico.
- **Dia 4:** Testes intensivos de Character Reference (CREF) em poses e humores variados.
- **Dia 5:** Preenchimento e finalização da Ficha Técnica Visual Biométrica completa.
- **Dia 6:** Organização profissional da Biblioteca de Identidade e curadoria de assets.
- **Dia 7:** Auditoria Final de Consistência, Validação de Marca e Aprovação Visual Geral.

---

## BLOCO 13 — FECHAMENTO DO MÓDULO 4
**Resumo:** Você cruzou a fronteira da amostragem aleatória para a produção profissional. Agora você tem um influenciador que não muda de rosto, que tem um DNA visual documentado e que está pronto para ser a cara de qualquer marca.

## TRANSIÇÃO PARA O MÓDULO 5
Prepare-se: Agora que sua marca tem rosto, alma e consistência inabalável, vamos mergulhar no Módulo 5, onde transformaremos essa imagem em uma máquina de produção de conteúdo em escala industrial, gerando autoridade e vendas no TikTok Shop.
`;
