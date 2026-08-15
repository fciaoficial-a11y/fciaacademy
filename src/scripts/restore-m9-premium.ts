import { forceRebuildModule9 } from "../lib/rebuild.functions";

async function run() {
  console.log("🚀 Iniciando restauração isolada do Módulo 9...");
  
  try {
    const result = await forceRebuildModule9();
    
    if (result.success) {
      console.log("✅ Módulo 9 restaurado com sucesso para a versão PREMIUM.");
      process.exit(0);
    } else {
      console.error("❌ Erro ao restaurar Módulo 9:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Erro fatal durante a execução:", error);
    process.exit(1);
  }
}

run();
