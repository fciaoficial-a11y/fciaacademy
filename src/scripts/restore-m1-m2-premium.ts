import { restorePremiumModules1And2 } from "../lib/rebuild.functions";

async function main() {
  console.log("🚀 Iniciando Restauração Controlada dos Módulos 1 e 2...");
  
  try {
    const result = await restorePremiumModules1And2();
    
    if (result.success) {
      console.log("✅ Restauração concluída com sucesso!");
      console.log("Relatório:", JSON.stringify(result.results, null, 2));
    } else {
      console.error("❌ Falha na restauração:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Erro fatal durante a execução:", error);
    process.exit(1);
  }
}

main();
