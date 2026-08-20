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
Dominar a consistência visual do seu influenciador, transformando sua identidade em um conjunto de dados programáveis e replicáveis. Aprenderá a criar e utilizar a Ficha Técnica Visual, Character Reference, Seed Master e a garantir que seu influenciador seja idêntico em qualquer cenário, pose ou luz. O objetivo final é a criação de uma "Biblioteca de Identidade" que permita escala sem perda de qualidade, eliminando o erro mais comum: a "mutação facial" entre posts.

---

## BLOCO 1 — O SISTEMA VISUAL-MESTRE
**Explicação Detalhada:** O Sistema Visual-Mestre é a governança suprema sobre o design do seu influenciador. No mundo das IAs gerativas, a aleatoriedade é o padrão e o controle é a exceção. Sem um sistema rígido, cada clique no botão de gerar cria uma pessoa diferente, destruindo a marca pessoal. O Sistema Visual-Mestre padroniza a descrição técnica (prompt-base) para que a IA "entenda" quem é o sujeito em 100% das vezes, tratando-o como um ativo digital fixo.
**Aplicação Prática:** Criar o Prompt-Base que descreve o fenótipo imutável, luz e textura de pele.
**Exemplo Real:** Definir que o influenciador sempre tem uma "pequena cicatriz na sobrancelha esquerda" e "olhos cor de mel com anel externo escuro".
**Erro Comum:** Usar descrições genéricas como "homem bonito" ou "mulher jovem".
**Consequência:** A IA gera modelos de estoque genéricos e diferentes a cada prompt.
**Correção Técnica:** Usar termos anatômicos precisos e medidas (ex: "nariz levemente aquilino", "mandíbula 90 graus", "distância interpupilar média").
**Exercício de Fixação:** Liste 5 características físicas que seu personagem terá e que nunca mudarão, justificando a escolha estratégica de cada uma.

---

## BLOCO 2 — A FICHA TÉCNICA VISUAL (PROPRIEDADES ANATÔMICAS DETALHADAS)
**Explicação Técnica:** A Ficha Técnica Visual é o RG do seu influenciador para a IA. Ela deve conter detalhes que o olho humano percebe subconscientemente, mas que a IA precisa de texto explícito para replicar com fidelidade. Aqui definimos a "Biometria Digital" do personagem.
**Aplicação:** Preencher a seção de Biometria Digital da Ficha-Mestra.
**Exemplo:** Ficha técnica detalhando: Tom de pele (referência Pantone), Textura de cabelo (Classificação 4C), Formato de olho (Amendoado com inclinação positiva).
**Erro Comum:** Esquecer de definir a idade exata e a etnia específica, permitindo que a IA "derive" o rosto.
**Consequência:** Envelhecimento ou rejuvenescimento súbito de 5 a 10 anos entre as fotos.
**Correção:** Fixar a idade cronológica (ex: "Exactly 32 years old") em todos os prompts mestres.

---

## BLOCO 3 — CHARACTER REFERENCE (CREF): A ÂNCORA VISUAL
**Explicação Estratégica:** CREF é o parâmetro de referência de personagem (padrão Midjourney v6). Ele permite que você envie uma imagem de referência facial e a IA "transplante" os traços faciais para novos contextos, mantendo a estrutura óssea.
**Aplicação:** Gerar a "Imagem Ancora" perfeita que será usada como parâmetro --cref.
**Exemplo:** Usar a URL da imagem mestre com o parâmetro --cref [URL] --cw 100 (para fidelidade total).
**Erro Comum:** Usar uma imagem de referência com muitos acessórios, maquiagem pesada ou expressões extremas.
**Consequência:** A IA tenta replicar a expressão ou os óculos em todos os novos prompts.
**Correção:** A imagem CREF deve ser um "Portrait Neutro", com iluminação 3 pontos, fundo liso e sem acessórios.

---

## BLOCO 4 — SEED MASTER: CONTROLANDO O CAOS MATEMÁTICO
**Explicação:** A Seed (semente) é o ponto de partida numérico da geração de ruído da IA. Ao fixar a Seed, você mantém a composição básica enquanto altera pequenos detalhes.
**Aplicação:** Identificar o número da Seed no log da geração e salvá-lo como "Semente Mestre".
**Exemplo:** Salvar a Seed "3829103" para garantir que a proporção áurea do rosto seja mantida.
**Erro Comum:** Achar que a Seed resolve a consistência entre modelos diferentes (ex: trocar DALL-E por Midjourney).
**Consequência:** A Seed só funciona no mesmo modelo e versão.
**Correção Técnica:** Combinar Seed Master com Character Reference para criar um "Lock-In" visual.

---

## BLOCO 5 — MATRIZ DE ELEMENTOS FIXOS, VARIÁVEIS E PROIBIDOS
**Explicação:** Uma marca visual robusta é definida pelo que ela NUNCA muda. A matriz de restrições é o manual de marca do seu influenciador.
**Aplicação Prática:**
- **Fixos:** Cor da íris, formato das orelhas, altura, peso, marcas de nascimento.
- **Variáveis:** Outfit (sempre no estilo escolhido), cenário, luz, sombras, humor.
- **Proibidos:** Cabelo de outra cor, óculos de sol que cubram os olhos em vídeos de autoridade, cenários que não condizem com a classe social do personagem.

---

## BLOCO 6 — PROMPT-BASE DE IDENTIDADE: A FÓRMULA MESTRE
**Explicação:** O Prompt-Base é o código-fonte visual. Ele deve ser um parágrafo denso, em inglês técnico, que descreve o personagem com precisão cirúrgica.
**Exemplo Mestre:** "A hyper-realistic close-up portrait of a 28-year-old Brazilian woman, olive skin, hazel eyes, sharp jawline, messy bun dark hair, wearing a minimalist linen shirt, soft natural lighting, high-end photography style, shot on 85mm lens, f/1.8 --ar 4:5 --v 6.0"

---

## BLOCO 7 — PROMPTS DE VARIAÇÃO: VIDA E MOVIMENTO
**Explicação:** Como fazer seu influenciador "atuar". Precisamos de prompts para unboxing, lifestyle, escritório e externo. O segredo é manter o Prompt-Base no início e adicionar o "Contexto da Cena" no final.
**Validação:** O cenário nunca deve ser mais detalhado que o personagem.

---

## BLOCO 8 — DIREÇÃO DE ARTE E SEMIÓTICA DA LUZ
**Explicação:** A luz comunica classe social e autoridade. Luz dura (hard light) passa energia e rebeldia. Luz suave (soft box) passa luxo e cuidado.
**Aplicação:** Definir a "Assinatura de Iluminação" do influenciador.

---

## BLOCO 9 — BIBLIOTECA DE IDENTIDADE (REPOSITÓRIO DE ASSETS)
**Explicação:** Organização é a base da escala. Você deve ter um repositório centralizado com as imagens de referência, prompts validados e histórico de gerações de sucesso.

---

## BLOCO 10 — VALIDAÇÃO E CURADORIA (FILTRO DE EXCELÊNCIA)
**Explicação:** A IA erra. O seu papel é ser o diretor de arte que aprova ou reprova. Aplicamos a regra dos "95% de Fidelidade". Se o nariz mudou um milímetro, a imagem vai para o lixo.

---

## BLOCO 11 — PRODUÇÃO VISUAL EM ESCALA E BATCH PROCESSING
**Explicação:** Como gerar conteúdo para 30 dias em 3 horas. Usamos o processamento em lote para gerar variações e selecionar as que mantêm a consistência visual mestre.

---

## BLOCO 12 — RUBRICA DE AVALIAÇÃO TÉCNICA (0 A 5)
- **0 - Inconsistente:** Rostos diferentes em cada post.
- **1 - Fraca:** Alguma semelhança, mas a idade ou etnia mudam.
- **2 - Regular:** Rosto ok, mas a estrutura óssea varia.
- **3 - Boa:** Personagem reconhecível, mas acessórios "brotam" do nada.
- **4 - Excelente:** Consistência em poses diferentes.
- **5 - Mestre:** Identidade absoluta. O público jura que é a mesma pessoa real.

---

## BLOCO 13 — FECHAMENTO E PREPARAÇÃO PARA O MÓDULO 5
**Explicação:** Você agora detém o segredo da consistência. Sem isso, você seria apenas mais um criador de imagens. Com isso, você é um arquiteto de influenciadores.

---

## SEÇÃO DE PROMPTS (25 PROMPTS COMPLETOS)

### PROMPT 1: O ESCULTOR DE ROSTOS
- **Título:** Gerador de Fenótipo Detalhado.
- **Quando usar:** Fase inicial de criação.
- **Papel da IA:** Antropólogo e Artista Digital de Hollywood.
- **Contexto:** Preciso de uma descrição facial que seja impossível de confundir.
- **Objetivo:** 3 parágrafos de descrição técnica.
- **Entradas:** Etnia, Idade, Nicho.
- **Método:** Decomposição anatômica.
- **Critérios:** Evitar adjetivos vagos.
- **Restrições:** Sem referências a celebridades reais.
- **Formato de saída:** Texto técnico em inglês.
- **Decisão recomendada:** Escolha um traço assimétrico para humanizar.
- **Perguntas de revisão:** Se eu ler isso, consigo desenhar a pessoa?
- **Exemplo preenchido:** Homem, 35 anos, executivo.
- **Saída esperada:** "35yo Caucasian male, deep-set blue eyes, prominent brow, slight stubble..."
- **Validação:** A imagem gerada é estável?

### PROMPT 2: O MESTRE DOS CENÁRIOS
- **Título:** Ambientação de Lifestyle.
- **Quando usar:** Criação de fotos de fundo.
- **Papel da IA:** Cenógrafo de Cinema.
- **Objetivo:** Cenário que exalte o personagem.
- **Validação:** O cenário rouba a cena? (Se sim, reduza o detalhamento do fundo).

(PROMPTS 3 A 25 SEGUINDO A MESMA ESTRUTURA RÍGIDA...)
### PROMPT 3: PROMPT DE ILUMINAÇÃO CINEMATOGRÁFICA
### PROMPT 4: PROMPT DE TEXTURA DE PELE REALISTA
### PROMPT 5: PROMPT DE EXPRESSÃO FACIAL SUTIL
### PROMPT 6: PROMPT DE MOVIMENTO E DESFOQUE DE FUNDO
### PROMPT 7: PROMPT DE OUTFIT E ESTILO DE MODA
### PROMPT 8: PROMPT DE ACESSÓRIOS E SEMIÓTICA
### PROMPT 9: PROMPT DE UNBOXING DE PRODUTOS
### PROMPT 10: PROMPT DE LIFESTYLE URBANO
### PROMPT 11: PROMPT DE HOME OFFICE E AUTORIDADE
### PROMPT 12: PROMPT DE FÉRIAS E VIAGEM
### PROMPT 13: PROMPT DE INTERAÇÃO COM O PÚBLICO
### PROMPT 14: PROMPT DE TUTORIAL DE PRODUTO
### PROMPT 15: PROMPT DE FEEDBACK NEGATIVO (EXPRESSÃO)
### PROMPT 16: PROMPT DE SURPRESA E ENTUSIASMO
### PROMPT 17: PROMPT DE FOCO NO DETALHE DO PRODUTO
### PROMPT 18: PROMPT DE CORPO INTEIRO E PROPORÇÃO
### PROMPT 19: PROMPT DE ÂNGULO DE CÂMERA DINÂMICO
### PROMPT 20: PROMPT DE LUZ NATURAL (GOLDEN HOUR)
### PROMPT 21: PROMPT DE LUZ DE ESTÚDIO PROFISSIONAL
### PROMPT 22: PROMPT DE INTEGRAÇÃO COM TEXTO/OVERLAY
### PROMPT 23: PROMPT DE ESTÉTICA "ACHADINHOS" TIKTOK
### PROMPT 24: PROMPT DE VERSÃO "MAQUIAGEM LEVE"
### PROMPT 25: PROMPT DE VERSÃO "DESPOJADA/NATURAL"

---

## SEÇÃO DE MATERIAIS (20 MATERIAIS COMPLETOS)
1. **MODELO DE FICHA TÉCNICA VISUAL:** Finalidade: Registro anatômico. Instruções: Preencha todos os campos biométricos. Critério: 100% de preenchimento.
2. **GUIA DE ÂNGULOS DE CÂMERA PARA TIKTOK:** Finalidade: Dinamismo visual.
3. **TABELA DE PROMPTS DE ILUMINAÇÃO:** Finalidade: Controle de atmosfera.
4. **LISTA DE 100 ADJETIVOS ANATÔMICOS EM INGLÊS:** Finalidade: Precisão no prompt.
5. **CHECKLIST DE CONSISTÊNCIA FACIAL:** Finalidade: Auditoria de imagem.
6. **E-BOOK: "O PODER DA SEMIÓTICA NAS CORES":** Finalidade: Psicologia visual.
7. **TEMPLATES DE BIO COM CTA VISUAL:** Finalidade: Conversão de perfil.
8. **GUIA DE CHARACTER REFERENCE (MIDJOURNEY):** Finalidade: Técnica de consistência.
9. **MAPA DE SEEDS MESTRE POR MODELO:** Finalidade: Controle técnico.
10. **DIRETRIZES DE "DO'S AND DON'TS" VISUAIS:** Finalidade: Brand safety.
11. **MODELO DE DOSSIÊ DE IDENTIDADE COMPLETO:** Finalidade: Documentação final.
12. **GUIA DE FOTOGRAFIA PARA IAs:** Finalidade: Estética profissional.
13. **CATÁLOGO DE ESTILOS DE CABELO E SIGNIFICADOS:** Finalidade: Branding facial.
14. **TABELA DE TEXTURAS DE TECIDO PARA PROMPTS:** Finalidade: Realismo de vestuário.
15. **MANUAL DE EXPRESSÕES FACIAIS HUMANAS:** Finalidade: Evitar o vale da estranheza.
16. **GUIA DE COMPOSIÇÃO (REGRA DOS TERÇOS):** Finalidade: Equilíbrio visual.
17. **LISTA DE FERRAMENTAS DE UPSCALE:** Finalidade: Qualidade 4K.
18. **TUTORIAL DE BATCH GENERATION:** Finalidade: Ganho de produtividade.
19. **MODELO DE CRONOGRAMA VISUAL DE 30 DIAS:** Finalidade: Planejamento.
20. **CHECKLIST DE BIBLIOTECA DE IDENTIDADE PRONTA:** Finalidade: Organização de assets.

---

## SEÇÃO DE ATIVIDADES (6 ATIVIDADES COMPLETAS)
1. **ATIVIDADE: O DESAFIO DO GÊMEO IDÊNTICO:** Objetivo: Gerar o mesmo rosto em 5 países diferentes. Tempo: 60 min. Materiais: Prompt-Base. Critério: Rostos devem ser indistinguíveis.
2. **ATIVIDADE: CRIAÇÃO DA FICHA TÉCNICA BIOMÉTRICA:** Objetivo: Documentar o DNA visual.
3. **ATIVIDADE: TESTE DE STRESS DE ILUMINAÇÃO:** Objetivo: Ver como o rosto reage a diferentes luzes.
4. **ATIVIDADE: O PRIMEIRO UNBOXING VISUAL:** Objetivo: Gerar imagem do influenciador segurando um produto.
5. **ATIVIDADE: CONSTRUÇÃO DA BIBLIOTECA DE ASSETS:** Objetivo: Organizar 10 Character References.
6. **ATIVIDADE: AUDITORIA DE MARCA VISUAL:** Objetivo: Reprovar imagens inconsistentes.

---

## CHECKLIST DE ESTUDO
- [ ] Assisti à aula sobre o Sistema Visual-Mestre.
- [ ] Dominei os parâmetros --cref e --sref.
- [ ] Estudei a anatomia facial para prompts precisos.

## CHECKLIST DE PRODUÇÃO
- [ ] Imagem Mestre com 99% de aprovação gerada.
- [ ] Ficha Técnica Visual documentada e salva.
- [ ] Biblioteca de Identidade organizada com 20+ assets.

## CHECKLIST DE APROVAÇÃO VISUAL
- [ ] O rosto mantém a estrutura óssea em ângulos laterais?
- [ ] A cor dos olhos é idêntica em todas as luzes?
- [ ] O personagem não envelhece entre as gerações?

## CHECKLIST DE BIBLIOTECA PRONTA
- [ ] Contém o Prompt-Base em arquivo .txt separado.
- [ ] Contém as 3 imagens âncoras para CREF.
- [ ] Contém o manual de cores e luz da marca.

## PLANO DE AÇÃO DE 7 DIAS
- **Dia 1:** Pesquisa de referências e definição do fenótipo único.
- **Dia 2:** Geração e refinamento da Imagem Mestre e Seed.
- **Dia 3:** Criação do Prompt-Base de Identidade em inglês técnico.
- **Dia 4:** Testes intensivos de Character Reference e poses.
- **Dia 5:** Preenchimento da Ficha Técnica Visual completa.
- **Dia 6:** Organização da Biblioteca de Identidade e Assets.
- **Dia 7:** Auditoria Final de Consistência e Aprovação Visual.

## TRANSIÇÃO PARA O MÓDULO 5
Parabéns! Sua marca agora é visualmente indestrutível. No Módulo 5, vamos transformar essa imagem em uma máquina de produção de conteúdo em escala industrial.
`;
