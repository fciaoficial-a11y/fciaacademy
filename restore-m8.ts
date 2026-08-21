
import { atomicPremiumRestore } from "./src/lib/rebuild.functions";
import { contentM8Premium } from "./src/lib/rebuild-m8.functions";

const questions = [
  {
    question: "O que caracteriza a 'Soberania Digital' no contexto do Módulo 8?",
    options: [
      "Dependência total de APIs de terceiros",
      "Capacidade de operar, produzir e validar ativos de forma offline e independente",
      "Uso exclusivo de ferramentas em nuvem paga",
      "Necessidade de login constante para validar roteiros"
    ],
    correct_answer: "Capacidade de operar, produzir e validar ativos de forma offline e independente",
    difficulty: "medium"
  },
  {
    question: "Qual é a regra absoluta da redundância física 3-2-1?",
    options: [
      "3 logins, 2 senhas, 1 usuário",
      "3 horas de trabalho, 2 pausas, 1 entrega",
      "3 cópias, 2 mídias diferentes, 1 fora do local físico original",
      "3 ferramentas, 2 redes, 1 servidor"
    ],
    correct_answer: "3 cópias, 2 mídias diferentes, 1 fora do local físico original",
    difficulty: "hard"
  },
  {
    question: "O que deve ser feito se um serviço de IA online falhar durante a produção soberana?",
    options: [
      "Parar a produção até o serviço voltar",
      "Utilizar o banco de prompts offline e o protocolo de emergência",
      "Tentar resetar o roteador repetidamente",
      "Migrar para outro serviço pago imediatamente"
    ],
    correct_answer: "Utilizar o banco de prompts offline e o protocolo de emergência",
    difficulty: "medium"
  }
];

async function run() {
  console.log("Iniciando restauração atômica do Módulo 8...");
  
  try {
    const result = await atomicPremiumRestore({
      data: {
        moduleSlug: "influenciador-ia-m8",
        content: contentM8Premium,
        questions: questions,
        title: "Módulo 8 — Isolamento e Soberania Digital"
      }
    });
    console.log("Resultado:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Erro na restauração:", error);
    process.exit(1);
  }
}

run();
