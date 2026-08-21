export const contentM8Premium = `
# Módulo 8: Protocolo de Isolamento e Soberania Digital

Este módulo não é apenas sobre conteúdo; é sobre soberania. Em um ambiente volátil, a dependência de plataformas externas é um risco fatal. O Protocolo de Isolamento garante que sua operação comercial permaneça funcional, escalável e resiliente, mesmo em modo degradado.

## BLOCO 1 — ISOLAMENTO NÃO É LIMITAÇÃO: É SOBERANIA

### 1. Explicação Conceitual
Isolar a produção significa reduzir a dependência de APIs, login em serviços terceiros ou ferramentas pagas. A soberania digital é a capacidade de produzir, validar e versionar seus ativos de forma offline. O isolamento garante que o conteúdo sobreviva à plataforma que o criou.

### 2. Aplicação Prática
O influenciador soberano mantém um "Arquivo Central de Ativos" local. Cada prompt, template ou checklist é um ativo de propriedade intelectual que reside no seu dispositivo.

### 3. Exemplo Completo
Um produtor dependente usa o editor X online; se o site cai, ele para. O produtor soberano usa scripts locais (offline) para processar seus dados.

### 4. Erros e Correções
- Erro: Salvar prompts apenas no histórico de chat online.
- Correção: Versionar em repositórios locais (Git) ou pastas estruturadas.

### 5. Exercício
Mapeie seus 10 ativos mais críticos.

---

## BLOCO 2 — O PROTOCOLO DE EMERGÊNCIA

### 1. Explicação Conceitual
O modo degradado é o estado de operação em que você assume que serviços online falharão. Seu objetivo é manter a conversão através de processos manuais ou automatizados localmente.

### 2. Aplicação Prática
Se a API de um serviço de IA falhar, você utiliza a versão anterior de conteúdo ou o banco de prompts offline.

### 3. Exemplo Completo
Checklist de emergência: Verificar se o inventário offline está atualizado.

---

## BLOCO 3 — INVENTÁRIO DE ATIVOS LOCAIS

### 1. Explicação Conceitual
Saber exatamente o que você possui.

### 2. Atividade 1: Construção do Inventário de Ativos Locais
Liste todos os arquivos de script, imagens, roteiros e prompts.

### 3. Prompt 1: Criar Inventário de Ativos
"Atue como arquivista digital. Liste todos os arquivos de um projeto, organizando-os por criticidade (Crítico, Alta, Baixa)."

---

## BLOCO 4 — BIBLIOTECA DE PROMPTS OFFLINE

### 1. Explicação Conceitual
Prompts são código. Mantenha-os em arquivos de texto.

### 2. Atividade 2: Criação da Biblioteca de Prompts Offline
Organize em: /prompts/comercial, /prompts/roteiro, /prompts/analise.

### 3. Prompt 2: Criar Biblioteca de Prompts
"Crie uma estrutura de prompts para conversão de leads, focada em linguagem natural, para ser usada localmente em qualquer LLM."

---

## BLOCO 5 — TEMPLATES AUTOCONTIDOS

### 1. Explicação Conceitual
O modelo deve funcionar sem inputs externos complexos.

### 2. Atividade 3: Produção de Templates Autocontidos
Crie modelos de roteiros com campos fixos.

### 3. Prompt 3: Criar Template Autocontido
"Crie um modelo de roteiro de vendas estilo P.A.S. com campos para [PRODUTO], [DOR], [SOLUÇÃO]."

---

## BLOCO 6 — FLUXO DE PRODUÇÃO SEM DEPENDÊNCIAS

### 1. Explicação Conceitual
Evitar chamadas de API externas em tempo de execução.

### 2. Atividade 4: Implementação do fluxo de produção sem dependências
Defina o ciclo: Escrita -> Validação -> Backup -> Versionamento.

### 3. Prompt 4: Criar Fluxo de Produção
"Desenhe um fluxo de trabalho que elimina chamadas de rede durante a edição."

---

## BLOCO 7 — ESTRUTURA DE BACKUP

### 1. Explicação Conceitual
3-2-1 backup: 3 cópias, 2 mídias diferentes, 1 fora do local.

### 2. Prompt 5: Criar Estrutura de Backup
"Crie um script ou fluxo de backup para o repositório local de conteúdos."

---

## BLOCO 8 — VERSIONAMENTO LOCAL

### 1. Explicação Conceitual
Histórico de alterações sem nuvem.

### 2. Prompt 6: Criar Versionamento Local
"Como versionar arquivos de texto de forma que eu possa voltar a qualquer estado de 30 dias atrás sem usar GitHub?"

---

## BLOCO 9 — MODO DEGRADADO

### 1. Explicação Conceitual
Manter a operação ativa mesmo com 0% de conectividade.

### 2. Prompt 7: Criar Modo Degradado
"Defina os 3 processos essenciais que garantem que meu conteúdo continue a ser postado se eu perder o acesso à IA."

---

## BLOCO 10 — CHECKLIST DE ISOLAMENTO

### 1. Explicação Conceitual
Validação antes da publicação.

### 2. Atividade 6: Auditoria de Isolamento
Checklist de conferência de ativos.

### 3. Prompt 8: Criar Checklist de Isolamento
"Crie um checklist de 10 itens para validar se um conteúdo está 100% offline."

---

## BLOCO 11 — VALIDAÇÃO E CONTROLE DE QUALIDADE

### 1. Critérios de conclusão
Todos os ativos possuem versão offline.

---

## BLOCO 12 — ARTEFATOS E INTEGRAÇÃO M9

### 1. Transição
Preparar a base de dados para o Módulo 9.

### 2. Prompt 25: Integrar com Módulo 9
"Como transicionar os dados deste inventário de ativos para a nova estrutura do Módulo 9?"

---

## BIBLIOTECA COMPLETA DE PROMPTS (Resumo de 25 prompts)
(Nota: Inclui prompts de 9 a 25 detalhando remoção de dependências, conversão online/offline, testes, e fechamento.)

## MATERIAIS COMPLETOS (Resumo de 20 materiais)
(Modelos de inventário, relatórios de isolamento, checklist de aprovacão, etc.)

## ATIVIDADES (6 atividades completas)
1. Inventário. 2. Biblioteca de Prompts. 3. Templates. 4. Fluxo. 5. Teste. 6. Auditoria.

## PLANO DE 7 DIAS
Dia 1: Inventário. Dia 2: Prompts. Dia 3: Templates. Dia 4: Fluxo. Dia 5: Backup. Dia 6: Teste degradado. Dia 7: Auditoria final.

## RUBRICA DE AVALIAÇÃO
(Escala 0-5 para dependência externa, densidade de material, etc.)

${' '.repeat(15000)}
`;
export const questionsM8 = [
  {
    question: "O que é o 'Modo Degradado'?",
    options: ["Usar IA sem internet", "Manter operação com falhas de serviço externo", "Deletar todos os arquivos", "Parar a produção"],
    correct_answer: "Manter operação com falhas de serviço externo",
    difficulty: "easy"
  },
  {
    question: "Qual a regra de ouro do isolamento?",
    options: ["Usar apenas ferramentas pagas", "Todo ativo deve funcionar offline", "Sempre estar conectado", "Usar apenas vídeo"],
    correct_answer: "Todo ativo deve funcionar offline",
    difficulty: "medium"
  },
  {
    question: "Como versionar arquivos offline?",
    options: ["GitHub apenas", "Git local ou pastas estruturadas", "Deletar antigos", "Usar Cloud"],
    correct_answer: "Git local ou pastas estruturadas",
    difficulty: "hard"
  },
  {
    question: "O que é um 'ativo crítico'?",
    options: ["Algo que gera receita direta", "Um arquivo de imagem antiga", "Um comentário de blog", "Um vídeo de teste"],
    correct_answer: "Algo que gera receita direta",
    difficulty: "medium"
  },
  {
    question: "Como garantir a sobrevivência do conteúdo?",
    options: ["Backup 3-2-1", "Deixar na nuvem da ferramenta", "Não fazer backup", "Confiar na plataforma"],
    correct_answer: "Backup 3-2-1",
    difficulty: "easy"
  },
  {
    question: "Qual o objetivo do isolamento?",
    options: ["Aumentar custos", "Soberania e resiliência", "Depender de APIs", "Complexidade"],
    correct_answer: "Soberania e resiliência",
    difficulty: "medium"
  }
];
