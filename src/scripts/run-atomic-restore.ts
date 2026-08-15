
import { restoreAtomicM3M4M5M8M11 } from "../lib/atomic-restore.functions";

async function run() {
  console.log("Iniciando Restauração Atômica (M3, M4, M5, M8, M11)...");
  try {
    const result = await restoreAtomicM3M4M5M8M11();
    console.log("Resultado bruto:", result);
    
    if (result && result.success) {
      console.log("SUCESSO: Restauração concluída.");
      console.table(result.results);
    } else {
      console.error("FALHA:", result ? result.error : "Sem resposta da função");
      process.exit(1);
    }
  } catch (e: any) {
    console.error("ERRO FATAL:", e.message);
    process.exit(1);
  }
}

run();

