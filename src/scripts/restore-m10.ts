import { forceRebuildModule10 } from "../lib/rebuild.functions";

async function restore() {
  console.log("🚀 Iniciando restauração atômica do Módulo 10...");
  
  try {
    const result = await forceRebuildModule10();
    
    if (result.success) {
      console.log("✅ Módulo 10 restaurado com sucesso (Premium v1)!");
      process.exit(0);
    } else {
      console.error("❌ Erro na restauração:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Erro crítico durante a execução:", error);
    process.exit(1);
  }
}

restore();
