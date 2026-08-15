import { forceRebuildAllModules } from "./src/lib/rebuild.functions.ts";

async function main() {
  console.log("🚀 Injetando Módulo 5 Premium...");
  try {
    const result = await forceRebuildAllModules();
    console.log("✅ Resultado:", result);
  } catch (error) {
    console.error("❌ Erro ao reconstruir módulos:", error);
    process.exit(1);
  }
}

main();
