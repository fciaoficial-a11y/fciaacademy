import { injectModule8 } from "../lib/restore-m8.functions";

async function run() {
  console.log("🚀 Iniciando Injeção Premium Isolada: Módulo 8");
  try {
    const result = await injectModule8();
    console.log("✅ Sucesso!", result);
  } catch (e) {
    console.error("❌ Erro na injeção:", e);
    process.exit(1);
  }
}

run();
