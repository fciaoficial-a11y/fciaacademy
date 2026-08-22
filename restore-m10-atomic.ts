import { contentM10Premium } from "./src/lib/rebuild-m10.functions";
import { atomicPremiumRestore } from "./src/lib/rebuild.functions";

async function restore() {
  console.log("Iniciando restauração atômica do Módulo 10...");
  
  const questions = [
    {
      question: "Qual é a regra de ouro para a execução de um teste A/B rigoroso?",
      options: ["Mudar todas as variáveis para ver o que acontece", "Mudar apenas uma variável por vez", "Mudar apenas o horário de publicação", "Usar o mesmo vídeo em duas contas diferentes"],
      correct_answer: "Mudar apenas uma variável por vez",
      difficulty: "easy"
    },
    {
      question: "O que indica uma queda brusca no início do gráfico de retenção?",
      options: ["O vídeo é muito longo", "O gancho falhou ou a promessa da capa não foi entregue", "O áudio está muito baixo", "O público não gosta do produto"],
      correct_answer: "O gancho falhou ou a promessa da capa não foi entregue",
      difficulty: "medium"
    },
    {
      question: "No protocolo M.A.P.E., o que significa 'Escalar'?",
      options: ["Mudar o nicho do canal", "Aumentar a verba ou replicar o formato de um vídeo vencedor", "Pausar o vídeo por 7 dias", "Trocar a voz da IA"],
      correct_answer: "Aumentar a verba ou replicar o formato de um vídeo vencedor",
      difficulty: "medium"
    },
    {
      question: "Qual destas é uma variável independente em um experimento de conteúdo?",
      options: ["Taxa de retenção", "Cor da legenda (que você controla)", "Número de curtidas", "Vendas no TikTok Shop"],
      correct_answer: "Cor da legenda (que você controla)",
      difficulty: "hard"
    },
    {
      question: "O que é uma hipótese falsificável?",
      options: ["Uma mentira sobre o produto", "Uma aposta que pode ser provada errada por dados", "Uma promessa de resultado garantido", "Um vídeo que não pode ser excluído"],
      correct_answer: "Uma aposta que pode ser provada errada por dados",
      difficulty: "hard"
    }
  ];

  try {
    // A chamada do server function em ambiente Node/Bun (SSR/Scripts) requer o objeto 'data'
    // pois o TanStack Start encapsula os argumentos. No entanto, o erro TypeError data.moduleSlug 
    // sugere que o handler recebeu 'undefined' para o argumento 'data'.
    // Em scripts externos usando bun, chamamos a função passando o objeto de entrada diretamente.
    const result = await atomicPremiumRestore({
      data: {
        moduleSlug: "influenciador-ia-m10",
        content: contentM10Premium,
        questions: questions,
        title: "Módulo 10: Estratégia de Publicação e Escala"
      }
    });
    console.log("Resultado:", result);
  } catch (e) {
    console.error("Erro na restauração:", e);
    process.exit(1);
  }
}

restore();
