
import { forceRebuildAllModules } from "../lib/rebuild.functions";

async function main() {
  console.log("🚀 Iniciando restauração premium do Módulo 6...");
  try {
    const result = await forceRebuildAllModules();
    console.log("✅ Sucesso:", result);
  } catch (error) {
    console.error("❌ Erro ao restaurar:", error);
    process.exit(1);
  }
}

main();
