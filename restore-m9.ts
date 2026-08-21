
import { contentM9Premium, questionsM9 } from "./src/lib/rebuild-m9.functions.ts";
import { atomicPremiumRestore } from "./src/lib/rebuild.functions.ts";

async function run() {
  console.log("INICIANDO RESTAURAÇÃO ATÔMICA — MÓDULO 9");
  
  // O createServerFn do TanStack Start espera o objeto diretamente no cliente, 
  // mas como estamos chamando via Bun no ambiente de teste, passamos o objeto data.
  const result = await atomicPremiumRestore({
    data: {
      moduleSlug: "influenciador-ia-m9",
      content: contentM9Premium,
      questions: questionsM9,
      title: "Módulo 9: Vitrine, Criativos e Apresentação de Produtos"
    }
  });
  
  console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
