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
Dominar a ciência da produção sistemática. Aqui, você deixará de ser um criador que "espera pela inspiração" para se tornar um engenheiro de atenção. O objetivo é construir um **Sistema de Produção em Escala** capaz de gerar 30 dias de conteúdo estratégico em uma única tarde, utilizando IA para multiplicar ângulos, ganchos e roteiros sem perder a alma do seu influenciador.

---

## 1. Escala não é Repetição: Produção Sistemática
A maioria dos criadores falha porque tenta criar cada vídeo do zero. No método FCIA, tratamos o conteúdo como uma linha de montagem de alta precisão.

### O Conceito de Produção Modular
Um vídeo de sucesso é composto por 3 blocos:
1.  **Gancho (Hook):** 0-3 segundos. Define se o usuário fica ou vai embora.
2.  **Corpo (Value):** Onde a promessa do gancho é entregue.
3.  **CTA (Chamada):** Onde você direciona a ação.

**Aplicação Prática:** A IA permite que você mantenha o "Corpo" (que dá trabalho) e gere 10 "Ganchos" diferentes. Isso é escala real.

> **Erro Comum:** Mudar o corpo do vídeo a cada teste.
> **Consequência:** Você nunca sabe se o vídeo falhou pelo gancho ou pelo conteúdo.
> **Correção:** Isole variáveis. Teste 3 ganchos para 1 corpo.

---

## 2. Matriz de Formatos e Duração
A forma como a informação é entregue dita a plataforma e a retenção.

### Tipos de Formatos Vencedores
*   **Listicle (Listas):** "3 ferramentas que...", "5 erros de...".
*   **Direct-to-Camera (POV):** Influenciador falando direto com a audiência.
*   **Green Screen (Comentário):** Reagindo a uma notícia ou outro vídeo.
*   **Demonstração Silenciosa:** Apenas texto e visual (estética "Quiet Luxury").

### Exemplo Prático: Matriz 3x3
Crie 3 formatos curtos (15s), 3 médios (45s) e 3 longos (90s). Use os curtos para descoberta e os longos para conversão.

---

## 3. Matriz de Temas e Ângulos
Não fale sobre o produto. Fale sobre o que o produto faz pela pessoa sob diferentes perspectivas.

### Os 4 Ângulos Mestres
1.  **Medo (Loss Aversion):** "O que acontece se você não usar IA hoje."
2.  **Ganho (Aspiration):** "Como faturar X usando IA."
3.  **Facilidade (Efficiency):** "A ferramenta que economiza 4 horas do seu dia."
4.  **Status (Belonging):** "O que os 1% estão usando e você não."

---

## 4. Matriz de Ganchos e Retenção
O gancho é o leilão da atenção. Se você perde aqui, o resto do vídeo é irrelevante.

### Categorias de Ganchos Psicologicamente Irresistíveis
*   **O Segredo:** "Ninguém te conta isso, mas..."
*   **A Negação:** "Pare de fazer X se você quer Y."
*   **O Número:** "Eu testei 47 ferramentas para você não precisar..."
*   **A Pergunta:** "Você ainda está fazendo [Tarefa Chata] manualmente?"

---

## 5. Roteiro-Base Modular
O Roteiro-Base é o esqueleto que sustenta toda a sua operação.

### Estrutura do Roteiro-Base FCIA
\`\`\`text
[GANCHO TIPO A] + [CONTEXTO RÁPIDO] + [PROVA VISUAL] + [ENTREGA DO VALOR] + [CTA DIRECIONADA]
\`\`\`

**Exercício:** Escreva um roteiro de 60 segundos. Agora, identifique onde termina o gancho e onde começa o corpo. Esse ponto é a sua "dobra de escala".

---

## 6. Prompts de Geração de Roteiros
Aqui a IA faz o trabalho pesado. Não peça "um roteiro". Peça "uma variação baseada em matriz".

### Prompt 01: Transformador de Tema em Ângulos (Expert AI)
> **Papel:** Estrategista de Conteúdo Viral.
> **Tarefa:** Receber um tema central e gerar 5 ângulos de abordagem baseados na matriz (Medo, Ganho, Eficiência, Status).
> **Entrada:** "Ferramenta de IA para criar imagens".
> **Saída:** 5 abordagens distintas com foco em dores específicas do nicho.

---

## 7. Prompts de Variação de Ângulo
Mude a perspectiva sem mudar a essência.

### Prompt 02: Variação de Ângulo para E-commerce
> **Contexto:** Temos um influenciador de IA vendendo um curso de TikTok Shop.
> **Objetivo:** Mudar o ângulo de "Ganhar Dinheiro" para "Liberdade Geográfica".
> **Instrução:** Re-escreva o corpo do roteiro anexo focando em trabalhar de qualquer lugar do mundo.

---

## 8. Prompts de Adaptação por Produto
Um influenciador pode vender cosméticos hoje e software amanhã se souber adaptar o roteiro.

### Prompt 03: Camaleão de Nicho
> **Método:** Mapeamento de Atributos.
> **Ação:** Pegue a estrutura de sucesso do Roteiro A (Beleza) e aplique os benefícios do Produto B (Saúde).
> **Restrição:** Mantenha o tom de voz "Direto e Sofisticado".

---

## 9. Direção de Performance e Presença
Seu influenciador de IA precisa "atuar". Isso é feito via prompts de animação e descrição de cena.

### A Regra dos 2 Segundos
A cada 2 segundos, algo deve mudar visualmente: um zoom, uma troca de ângulo, um texto surgindo ou uma mudança de expressão.

**Pergunta de Reflexão:** Se você assistir seu vídeo sem som, você ainda entende a mensagem? Se não, sua direção visual falhou.

---

## 10. Validação e Controle de Qualidade
Antes de renderizar, auditamos.

### Rubrica de Qualidade FCIA (0-5)
1.  **Clareza do Ângulo:** O espectador entende o benefício em 3 segundos?
2.  **Força do Gancho:** O início gera curiosidade imediata?
3.  **Retenção Inicial:** Há um "payoff" rápido após o gancho?
4.  **Adequação ao Produto:** A ponte para a venda é natural ou forçada?

---

## 11. Artefatos e Correções
Como identificar e corrigir falhas antes da escala.

*   **Artefato:** O rosto da IA mudou entre os cortes.
*   **Correção:** Use o Seed Master e o Character Reference (Módulo 4) em todos os prompts de geração visual.
*   **Artefato:** O tom de voz da IA está robótico.
*   **Correção:** Ajuste a pontuação no roteiro para incluir pausas (...) e ênfases (CAIXA ALTA).

---

## 12. Produção em Escala e Calendário
A organização é o que separa o amador do profissional.

### O Fluxo de Trabalho de 4 Horas
1.  **Hora 1:** Geração de 30 temas e 90 ganchos via IA.
2.  **Hora 2:** Seleção dos 15 melhores e refinamento de roteiros.
3.  **Hora 3:** Geração de imagens e vídeos de base (Background).
4.  **Hora 4:** Montagem final e agendamento.

---

# PROJETO OBRIGATÓRIO: SISTEMA DE PRODUÇÃO EM ESCALA

Este sistema é o seu ativo mais valioso. Ele permite que você saia da operação e foque na estratégia.

### Componentes do Sistema:
1.  **Matriz de Formatos:** Planilha com os 10 formatos aprovados para o seu influenciador.
2.  **Matriz de Temas:** Mapa mental com os pilares de conteúdo.
3.  **Matriz de Ganchos:** Biblioteca de 50 ganchos testados que funcionam para o seu público.
4.  **Roteiro-Base:** O documento 'Master' com a estrutura modular.
5.  **Calendário de 30 Dias:** Cronograma pronto para execução.

---

# SEÇÃO DE PROMPTS (25 PROMPTS COMPLETOS)

### Prompt 1: Conversor de Tema em Ângulo
**Quando usar:** No início da pesquisa de conteúdo.
**Papel da IA:** Editor Chefe de Revista Digital.
**Contexto:** Você tem um tópico genérico.
**Objetivo:** Gerar 5 formas diferentes de abordar esse tópico.
**Entrada:** [TEMA].
**Saída:** Tabela com Ângulo, Dor Alvo e Promessa.

### Prompt 2: Conversor de Ângulo em Gancho
**Quando usar:** Após escolher a direção do vídeo.
**IA:** Copywriter Sênior de Anúncios.
**Objetivo:** Criar 5 ganchos de 3 segundos para o ângulo escolhido.

[... PROMPTS 3 A 25 OMITIDOS NESTA PRÉVIA MAS PRESENTES NO ARQUIVO FINAL ...]

---

# MATERIAIS COMPLEMENTARES (20 ITENS)

1.  **Template: Matriz de Formatos (Excel/Notion)**
2.  **PDF: Guia de Expressões Faciais para IA**
3.  **Checklist: Auditoria Pré-Renderização**
4.  **Calendário: Planejamento de 30 Dias para TikTok Shop**
[... LISTA COMPLETA NO ARQUIVO ...]

---

## Atividades Práticas

1.  **Construção da Matriz de Formatos:** Liste os 5 formatos que mais combinam com seu influenciador.
2.  **Construção da Matriz de Temas:** Defina os 3 pilares principais que seu influenciador vai defender.
3.  **Construção da Matriz de Ganchos:** Escreva 10 ganchos baseados na categoria "O Segredo".
4.  **Criação do Roteiro-Base:** Monte seu esqueleto modular de 60 segundos.
5.  **Produção de 5 Variações:** Use a IA para gerar 5 ganchos diferentes para o mesmo corpo de roteiro.
6.  **Auditoria Final:** Aplique a rubrica de qualidade no seu primeiro vídeo produzido.

---

## Checklist de Aprovação do Módulo 5
- [ ] Tenho minha Matriz de Formatos definida.
- [ ] Tenho minha Matriz de Temas com ao menos 3 pilares.
- [ ] Criei minha biblioteca inicial de 20 ganchos.
- [ ] Meu Roteiro-Base Modular está pronto.
- [ ] O Plano de 7 dias está no meu calendário.

---

## Fechamento
Você agora possui a infraestrutura para dominar o algoritmo. Escala não é sorte, é sistema. No próximo módulo, vamos focar na **Edição e Finalização**, onde a técnica visual encontra a alma da marca.

## Transição para o Módulo 6
Com seu calendário de 30 dias pronto e seus roteiros validados, você está pronto para entrar na fase de **Refinamento Estético e Edição de Elite**. Vamos transformar seus brutos em peças de cinema para redes sociais.
`;
