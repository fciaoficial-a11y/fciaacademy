import { forceRebuildAllModules } from "../lib/rebuild.functions.ts";

async function main() {
  console.log("Iniciando injeção do Módulo 6 Premium...");
  try {
    const result = await forceRebuildAllModules();
    console.log("Resultado da injeção:", result);
    if (result.success) {
      console.log("Módulo 6 injetado com sucesso no banco de dados.");
    } else {
      console.error("Erro na injeção.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Falha fatal na execução do script:", error);
    process.exit(1);
  }
}

main();
