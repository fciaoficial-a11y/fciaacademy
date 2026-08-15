
import { restoreM8PremiumV3 } from "../lib/restore-m8-v3.functions";
import { restoreM11PremiumV2 } from "../lib/restore-m11-v2.functions";

async function main() {
  console.log("🚀 Iniciando restauração controlada de M8 e M11...");
  
  const r8 = await restoreM8PremiumV3();
  console.log("M8:", r8.message);
  
  const r11 = await restoreM11PremiumV2();
  console.log("M11:", r11.message);
  
  console.log("✅ Processo concluído.");
}

main().catch(console.error);
