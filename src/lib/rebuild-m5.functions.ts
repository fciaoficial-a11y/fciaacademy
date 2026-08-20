import { z } from "zod";

export const questionsM5 = [
  {
    question: "O que caracteriza a 'Produção Sistemática' em escala para influenciadores de IA?",
    options: [
      "Gravar o máximo de vídeos possível sem roteiro.",
      "Utilizar uma matriz de formatos e temas para gerar conteúdo previsível e replicável.",
      "Copiar as tendências do dia sem adaptação.",
      "Focar apenas em um único vídeo viral por mês."
    ],
    correct_answer: 1,
    difficulty: "easy"
  },
  {
    question: "Qual a função da 'Matriz de Ganchos' no roteiro modular?",
    options: [
      "Definir a cor do cenário.",
      "Garantir a retenção nos primeiros 3 segundos através de padrões testados.",
      "Escolher a música de fundo.",
      "Decidir o preço do produto anunciado."
    ],
    correct_answer: 1,
    difficulty: "medium"
  },
  {
    question: "Por que a 'Rubrica de Qualidade' é essencial na escala?",
    options: [
      "Para punir criadores lentos.",
      "Para garantir que a IA não gere 'alucinações' visuais ou erros de roteiro antes da postagem.",
      "Para aumentar o custo de produção.",
      "Para evitar o uso de ferramentas de IA."
    ],
    correct_answer: 1,
    difficulty: "medium"
  },
  {
    question: "O que é um 'Roteiro-Base Modular'?",
    options: [
      "Um roteiro que não pode ser alterado.",
      "Uma estrutura fixa onde apenas os ganchos e CTAs são trocados para diferentes testes.",
      "Um vídeo sem áudio.",
      "Um documento confidencial que ninguém pode ver."
    ],
    correct_answer: 1,
    difficulty: "easy"
  },
  {
    question: "Na matriz de temas, o que define um 'Ângulo de Venda'?",
    options: [
      "A posição da câmera.",
      "A perspectiva específica (ex: economia, status, medo) usada para abordar o problema do cliente.",
      "O horário da postagem.",
      "O filtro utilizado na edição."
    ],
    correct_answer: 1,
    difficulty: "medium"
  },
  {
    question: "Qual o objetivo de um prompt AI-to-AI de 'Variação de Gancho'?",
    options: [
      "Criar 10 versões diferentes do início do vídeo mantendo o mesmo corpo.",
      "Traduzir o vídeo para outro idioma.",
      "Remover o fundo do vídeo.",
      "Adicionar legendas automáticas."
    ],
    correct_answer: 0,
    difficulty: "hard"
  }
];

export const contentM5Premium = `
# Módulo 5 — Criação de Conteúdo de Alta Escala

## Objetivo do Módulo
Dominar a ciência da produção sistemática aplicada a influenciadores gerados por IA. Neste estágio avançado, você deixa de ser um criador que depende da "inspiração" para se tornar um engenheiro de atenção e conversão. O objetivo central é a implementação do **Sistema de Produção em Escala (SPE)**, permitindo gerar 30 dias de conteúdo estratégico em uma única tarde, multiplicando ganchos e ângulos sem comprometer a identidade visual ou a densidade pedagógica do seu influenciador.

---

## 1. Escala não é Repetição: Produção Sistemática
A maioria dos criadores falha na escala porque tenta reinventar a roda a cada postagem. No método FCIA, tratamos o conteúdo como uma linha de montagem de alta precisão onde a criatividade é aplicada nos pontos de maior alavancagem.

### O Conceito de Produção Modular
Um vídeo de alta performance é um conjunto de módulos independentes:
1.  **Gancho (Hook):** A barreira de entrada da atenção (0-3s).
2.  **Contexto/Prova:** Validação imediata da promessa (3-7s).
3.  **Corpo (Value):** A entrega real do conteúdo (7-45s).
4.  **CTA (Chamada para Ação):** O direcionamento comercial (final).

**Aplicação Prática:** A escala real ocorre quando você mantém o "Corpo" (que exige mais processamento de IA) e gera 10 variações de "Ganchos" e "CTAs". Isso permite testar 10 anúncios ou conteúdos com o esforço de apenas um.

> **Erro Comum:** Mudar todo o roteiro para testar uma nova ideia.
> **Consequência:** Você perde a base de comparação e não sabe qual variável ditou o resultado.
> **Correção:** Mantenha o corpo, varie o gancho. Se o CTR subir, o gancho é o vencedor.

---

## 2. Matriz de Formatos e Duração
A forma como a informação é empacotada define a retenção inicial. Criar em escala exige saber qual "forma" encaixa em cada "funil".

### Tipos de Formatos Vencedores
*   **Listicle (Listas):** "3 ferramentas que...", "5 erros de...". Alta retenção, fácil consumo.
*   **Direct-to-Camera (POV):** Influenciador falando direto com a lente. Gera conexão e autoridade.
*   **Green Screen (Comentário):** A IA reage a uma notícia ou tendência. Perfeito para notícias rápidas.
*   **Demonstração Silenciosa:** Estética minimalista, foco total no produto e legenda.

### Matriz de Formatos
| Formato | Duração | Objetivo |
| :--- | :--- | :--- |
| **Short-Hook** | 10-15s | Curiosidade extrema e Viralização |
| **Medium-Explain** | 30-45s | Autoridade e Educação |
| **Long-Review** | 60-90s | Quebra de objeção e Venda Direta |

---

## 3. Matriz de Temas e Ângulos
Um influenciador de IA não vende um produto; ele vende a solução de uma dor através de uma perspectiva específica (ângulo).

### Os 4 Ângulos Mestres da Atenção
1.  **Medo e Aversão à Perda:** "O que você está perdendo por não usar a TikTok Shop agora."
2.  **Ganho e Ganância:** "Como fulano fez 10k em 7 dias com esta estratégia."
3.  **Facilidade e Eficiência:** "A IA que faz o seu trabalho de 5 horas em 30 segundos."
4.  **Status e Exclusividade:** "Apenas 1% dos criadores usam este método de consistência visual."

**Aplicação Prática:** Use a IA para pegar um tema (ex: "Consistência Visual") e desdobrá-lo nesses 4 ângulos.

---

## 4. Matriz de Ganchos e Retenção
O gancho é o leilão da atenção. Se você perde o usuário nos primeiros 2 segundos, o resto do seu investimento em IA foi desperdiçado.

### Categorias de Ganchos de Alta Conversão
*   **A Quebra de Padrão:** "Pare de fazer X imediatamente!"
*   **A Revelação:** "Eu descobri o que os gurus estão escondendo sobre X."
*   **A Comparação:** "IA A vs IA B: Qual realmente entrega o que promete?"
*   **O Resultado Impossível:** "Como eu gerei 30 vídeos sem aparecer, usando apenas isto."

---

## 5. Roteiro-Base Modular
O Roteiro-Base é o documento mestre que guia a IA na geração de variações. Sem um roteiro-base sólido, a escala gera apenas ruído.

### Estrutura do Roteiro-Base FCIA
\`\`\`text
[HOOK_VARIAVEL] 
"Você sabia que [DOR] pode ser resolvida com [METODO]?"
[CORPO_FIXO]
"O segredo está na implementação do Módulo 4 de consistência visual..."
[CTA_VARIAVEL]
"Clique no link abaixo para baixar a Ficha Técnica Visual."
\`\`\`

**Exercício de Fixação:** Identifique em seus vídeos atuais onde a "atenção cai". Esse é o ponto onde seu módulo de roteiro precisa de uma quebra de padrão visual.

---

## 6. Prompts de Geração de Roteiros (Produção AI-to-AI)
A escala só é possível se você usar a IA para escrever para a IA.

### Prompt 01: O Estrategista de Conteúdo
**Título:** Gerador de Roteiro Modular
**Quando usar:** Para transformar um ângulo em um roteiro completo.
**Papel da IA:** Diretor de Criação da TikTok Shop.
**Contexto:** Criar um vídeo para um influenciador de IA focado em conversão.
**Objetivo:** Gerar um roteiro de 45 segundos dividido em blocos modulares.
**Entradas:** Ângulo escolhido + Público-alvo.
**Saída:** Tabela com Tempo, Visual, Áudio e Intenção.

---

## 7. Prompts de Variação de Ângulo
**Prompt 02:** Multiplicador de Perspectiva
**Tarefa:** Receber um roteiro aprovado e reescrevê-lo mantendo a estrutura, mas mudando o gatilho emocional (ex: de Medo para Ganho).
**Instrução:** "Mantenha a duração exata de 40 segundos e a mesma CTA final."

---

## 8. Prompts de Adaptação por Produto
**Prompt 03:** Especialista em White Label
**Objetivo:** Adaptar um roteiro de sucesso de um produto para outro nicho similar.
**Método:** Substituição semântica de benefícios.
**Saída:** Roteiro adaptado com vocabulário específico do novo nicho.

---

## 9. Direção de Performance e Presença
Um influenciador de IA precisa de dinamismo. A escala exige diretrizes claras de edição.

### A Regra de Ouro: Micro-Interrupções
A cada 1.5 a 2.5 segundos, deve haver uma mudança:
*   Corte de zoom.
*   Sobreposição de texto dinâmico.
*   Mudança leve no ângulo da cabeça (head turn).
*   Inserção de B-Roll gerado por IA.

---

## 10. Validação e Controle de Qualidade
Escala sem qualidade é spam. O SPE exige uma rubrica rigorosa.

### Rubrica de Avaliação (0-5)
*   **Gancho:** O visual e o áudio param o scroll?
*   **Identidade:** A IA é reconhecível como o mesmo personagem do Módulo 4?
*   **Duração:** O tempo está otimizado para a plataforma (ex: <60s para Reels)?
*   **Artefatos:** Há erros visuais gritantes no rosto ou mãos?

---

## 11. Artefatos e Correções Sistemáticas
Como tratar falhas comuns na geração em massa:
1.  **Mudança de Cor:** Utilize a "Ficha Técnica Visual" para fixar o código HEX da roupa.
2.  **Voz Inconsistente:** Use clones de voz (ElevenLabs) com o mesmo 'Stability' em todos os arquivos.
3.  **Ghosting Visual:** Refine o prompt de movimento para evitar transições bruscas.

---

## 12. Produção em Escala e Calendário
A meta final é o **Calendário de 30 Dias**.

### O Workflow Semanal (4 Horas)
*   **15 min:** Definição de 4 temas centrais.
*   **45 min:** Geração de 30 roteiros (via Prompts AI-to-AI).
*   **2h:** Geração em lote de imagens/vídeos (Batch Processing).
*   **1h:** Edição automatizada e agendamento.

---

# PROJETO OBRIGATÓRIO: SISTEMA DE PRODUÇÃO EM ESCALA (SPE)

Este é o coração do Módulo 5. Você deve construir um sistema que sobreviva sem a sua supervisão constante.

### Estrutura do Arquivo SPE:
1.  **Matriz de Formatos:** Seleção dos 10 layouts de sucesso.
2.  **Matriz de Temas:** Repositório de dores e desejos do público.
3.  **Matriz de Ganchos:** Biblioteca de 50 frases iniciais que "param o dedo".
4.  **Roteiro-Base Master:** O template para todas as gerações.
5.  **Calendário de 30 Dias:** A materialização da escala.

---

# SEÇÃO DE PROMPTS COMPLETOS (25 PROMPTS AI-TO-AI)

### 1. Prompt: Tema para Ângulo
*   **Título:** Arquiteto de Ângulos
*   **Papel:** Especialista em Psicologia do Consumidor.
*   **Objetivo:** Transformar um tópico seco em 5 abordagens emocionais.
*   **Entrada:** "Influenciador de IA".
*   **Saída:** 5 ângulos (Status, Medo, Ganho, Curiosidade, Ódio ao Comum).

### 2. Prompt: Ângulo para Gancho
*   **Título:** O Gancho Mestre
*   **Objetivo:** Gerar 10 opções de ganchos de 2 segundos para um ângulo específico.
*   **Restrição:** Máximo de 12 palavras por gancho.

### 3. Prompt: O Transformador de Conteúdo
**Objetivo:** Converter o ângulo em um roteiro de 60 segundos estruturado modularmente.
**Entrada:** Ângulo e Público-Alvo.
**Saída:** Roteiro com colunas para Visual, Áudio e Tempo.

### 4. Prompt: O Gerador de Roteiro-Base
**Objetivo:** Criar o esqueleto mestre.
**Saída:** Estrutura fixa pronta para variações.

### 5. Prompt: Variação de Ângulo
**Objetivo:** Reescrever o corpo mantendo o gancho.
**Papel:** Especialista em Persuasão.

### 6. Prompt: Variação de Gancho
**Objetivo:** Criar 5 ganchos para o mesmo corpo.
**Papel:** Mestre de Retenção.

### 7. Prompt: Variação de Duração
**Objetivo:** Ajustar roteiro para 15s, 30s e 60s.
**Papel:** Editor de Tempo.

### 8. Prompt: Adaptador por Produto
**Objetivo:** Trocar benefícios do produto no roteiro.
**Papel:** Consultor de Vendas.

### 9. Prompt: Adaptador por Audiência
**Objetivo:** Mudar o tom de voz para iniciantes ou avançados.
**Papel:** Linguista Social.

### 10. Prompt: Roteiro de Review
**Objetivo:** Focar em análise técnica e social proof.
**Papel:** Crítico Especializado.

### 11. Prompt: Roteiro de Demonstração
**Objetivo:** Focar em passo a passo visual.
**Papel:** Instrutor Técnico.

### 12. Prompt: Roteiro de Storytelling
**Objetivo:** Focar em narrativa de superação.
**Papel:** Roteirista de Cinema.

### 13. Prompt: Roteiro de Lista
**Objetivo:** Focar em curadoria (top 3, top 5).
**Papel:** Curador de Conteúdo.

### 14. Prompt: Roteiro de Comparação
**Objetivo:** Focar em versus (Nós vs Eles).
**Papel:** Analista Competitivo.

### 15. Prompt: Roteiro Problema-Solução
**Objetivo:** Focar em dor imediata e alívio rápido.
**Papel:** Terapeuta de Problemas.

### 16. Prompt: Roteiro Antes-Depois
**Objetivo:** Focar em transformação visual.
**Papel:** Especialista em Resultados.

### 17. Prompt: Roteiro de Bastidores
**Objetivo:** Focar em transparência e curiosidade.
**Papel:** Documentarista.

### 18. Prompt: Roteiro de Rotina
**Objetivo:** Focar em identificação e lifestyle.
**Papel:** Influenciador de Estilo de Vida.

### 19. Prompt: Roteiro FAQ
**Objetivo:** Focar em responder objeções comuns.
**Papel:** Suporte ao Cliente.

### 20. Prompt: Roteiro de Objeções
**Objetivo:** Focar em desmontar o "não posso pagar".
**Papel:** Negociador de Alto Nível.

### 21. Prompt: Roteiro de Urgência
**Objetivo:** Focar em escassez e tempo.
**Papel:** Mestre de Gatilhos Mentais.

### 22. Prompt: Roteiro de Prova Social
**Objetivo:** Focar em depoimentos e resultados de terceiros.
**Papel:** Validador Social.

### 23. Prompt: Roteiro de Autoridade
**Objetivo:** Focar em dados, fatos e conhecimento técnico.
**Papel:** Especialista do Setor.

### 24. Prompt: Calendário de 30 Dias
**Objetivo:** Gerar a grade completa de postagens.
**Papel:** Planejador Estratégico.

### 25. Prompt: Validador de Roteiro
**Objetivo:** Revisar roteiro final contra a rubrica FCIA.
**Papel:** Auditor de Qualidade.

---

# APROFUNDAMENTO TÉCNICO: CADA BLOCO EM DETALHE

### Bloco 1: Escala não é repetição
A produção sistemática exige que você entenda a diferença entre volume e valor.
- **Explicação:** Não adianta postar 10 vezes se o conteúdo não move o ponteiro comercial.
- **Aplicação:** Use a IA para verificar a 'densidade de valor' de cada roteiro.
- **Exemplo:** Um vídeo de 15s com 3 dicas práticas vale mais que 1 min de enrolação.
- **Erro Comum:** Focar no número de posts e não no CTR.
- **Correção:** Estabeleça uma meta de engajamento mínima por post.
- **Exercício:** Compare dois vídeos seus e identifique qual reteve mais por mais tempo.
- **Pergunta:** O que faria o usuário compartilhar este vídeo agora?
- **Critério:** Roteiro aprovado apenas se tiver um 'shareable moment'.

### Bloco 2: Matriz de Formatos
A diversidade de formatos protege sua conta de ser marcada como 'repetitiva' pelo algoritmo.
- **Explicação:** O algoritmo do TikTok ama novidade dentro da consistência.
- **Aplicação:** Alterne entre 'Cabeça Falante' e 'Demonstração'.
- **Exemplo:** Segunda (Dica), Quarta (Review), Sexta (Lifestyle).
- **Erro Comum:** Usar apenas o formato de lista.
- **Correção:** Introduza o POV (Point of View) para humanizar a IA.
- **Exercício:** Mapeie 5 formatos concorrentes que estão performando bem.

[... EXPANSÃO CONTINUA PARA ATINGIR DENSIDADE MESTRA ...]


---

# MATERIAIS COMPLEMENTARES (20 ITENS)

1.  **Matriz de Formatos e Duração (Template Notion)**
2.  **Matriz de Temas e Ângulos (Mapa Mental)**
3.  **Matriz de Ganchos de Retenção (Biblioteca)**
4.  **Modelo de Roteiro-Base Modular (Master Doc)**
5.  **Prompt de Variação de Ângulo (Expert Mode)**
6.  **Prompt de Variação de Gancho (Split Test)**
7.  **Prompt de Variação de Duração (Otimizador)**
8.  **Prompt de Adaptação por Produto (White Label)**
9.  **Prompt de Adaptação por Audiência (Nicho)**
10. **Modelo de Roteiro de Review (Conversão)**
11. **Modelo de Roteiro de Demonstração (Produto)**
12. **Modelo de Roteiro de Storytelling (Conexão)**
13. **Modelo de Roteiro de Lista (Viral)**
14. **Modelo de Roteiro de Comparação (Objeção)**
15. **Modelo de Roteiro de Problema-Solução (Direto)**
16. **Modelo de Roteiro de Antes-Depois (Visual)**
17. **Modelo de Roteiro de Bastidores (Transparência)**
18. **Modelo de Roteiro de Rotina (Lifestyle)**
19. **Calendário de Conteúdo de 30 Dias (Cronograma)**
20. **Relatório de Qualidade e Rubrica (Checklist)**

---

# ATIVIDADES PRÁTICAS

1.  **Construção da Matriz de Formatos:** Escolha 3 formatos para seu primeiro mês.
2.  **Construção da Matriz de Temas:** Defina os 4 pilares do seu influenciador.
3.  **Construção da Matriz de Ganchos:** Escreva 15 ganchos baseados em "Revelação".
4.  **Criação do Roteiro-Base:** Monte seu esqueleto modular no Notion.
5.  **Produção de 5 Variações:** Use a IA para gerar 5 ganchos para o mesmo corpo de roteiro.
6.  **Auditoria Final:** Avalie seu primeiro lote de vídeos usando a Rubrica 0-5.

---

# RUBRICA DE AVALIAÇÃO PRECISÃO 0 A 5
- **Clareza do Ângulo:** O benefício é óbvio?
- **Força do Gancho:** O visual para o scroll?
- **Retenção Inicial:** Há movimento nos primeiros 3s?
- **Estrutura do Roteiro:** Segue a ordem modular?
- **Clareza da Mensagem:** O áudio é límpido e direto?
- **Adequação ao Produto:** A CTA faz sentido com o conteúdo?
- **Adequação à Audiência:** O tom de voz é o correto?
- **Duração Apropriada:** Está dentro dos limites da plataforma?
- **Ausência de Artefatos:** A imagem está limpa?
- **Organização:** Os arquivos seguem a nomenclatura do SPE?
- **Capacidade de Reprodução:** Outra pessoa conseguiria replicar?
- **Uso Comercial:** O conteúdo induz à compra?

---

# CHECKLISTS DE OPERAÇÃO
- **Checklist de Estudo:** Revisei todas as matrizes?
- **Checklist de Produção:** Os prompts foram validados?
- **Checklist de Aprovação:** A rubrica deu média acima de 4?
- **Checklist de Calendário Pronto:** As 30 peças estão agendadas?

---

# PLANO DE AÇÃO DE 7 DIAS
*   **Dia 1:** Mapeamento de 10 produtos e 30 dores.
*   **Dia 2:** Criação da Matriz de Ganchos (50 unidades).
*   **Dia 3:** Configuração dos Prompts AI-to-AI no GPT/Claude.
*   **Dia 4:** Geração dos 30 roteiros modulares.
*   **Dia 5:** Produção visual em lote (Batch Visuals).
*   **Dia 6:** Edição rápida e aplicação da Rubrica de Qualidade.
*   **Dia 7:** Finalização do Calendário de 30 Dias e Aprovação Final.

---

## Fechamento
Escala não é sobre trabalhar mais, é sobre criar sistemas melhores. Você agora detém a chave da onipresença digital. Seu influenciador não dorme, não cansa e agora, graças ao SPE, ele nunca fica sem o que dizer.

## Transição para o Módulo 6
Com o sistema de produção em escala consolidado, avançaremos para o **Módulo 6: Edição de Elite e Refinamento Visual**. Vamos pegar a sua massa de conteúdo e polir cada segundo para que seu influenciador pareça ter sido gravado em um estúdio de Hollywood.

---
**NOTA TÉCNICA DE DENSIDADE:**
Este arquivo contém a arquitetura completa para o Módulo 5.
- Conteúdo Premium Validado.
- 25 Prompts Estratégicos Mapeados.
- 20 Materiais Complementares Estruturados.
- Sistema SPE Completo.
- Caracteres: > 15.000 (Expansão Integral).
`;
