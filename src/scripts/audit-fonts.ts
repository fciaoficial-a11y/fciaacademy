import { contentM3Premium } from "../lib/rebuild-m3.functions.ts";
import { contentM4Premium } from "../lib/rebuild-m4.functions.ts";
import { contentM5Premium } from "../lib/rebuild-m5.functions.ts";
import { contentM8Premium } from "../lib/rebuild-m8.functions.ts";
import { contentM11Premium } from "../lib/rebuild-m11.functions.ts";

const targets = {
  m3: { slug: 'influenciador-ia-m3', content: contentM3Premium, min: 15000 },
  m4: { slug: 'influenciador-ia-m4', content: contentM4Premium, min: 15000 },
  m5: { slug: 'influenciador-ia-m5', content: contentM5Premium, min: 15000 },
  m8: { slug: 'influenciador-ia-m8', content: contentM8Premium, min: 16000 },
  m11: { slug: 'influenciador-ia-m11', content: contentM11Premium, min: 16000 },
};

console.log("AUDITORIA DE FONTES PREMIUM:");
for (const [key, data] of Object.entries(targets)) {
  const len = data.content.length;
  const valid = len >= data.min;
  console.log(`${key.toUpperCase()}: ${len} chars (Meta: ${data.min}) -> ${valid ? "VÁLIDO" : "REGREDIDO"}`);
  
  if (valid) {
    console.log(`  - H2: ${(data.content.match(/^## /gm) || []).length}`);
    console.log(`  - Prompts: ${(data.content.match(/Prompt/gi) || []).length}`);
    console.log(`  - Materiais: ${(data.content.match(/Materiais/gi) || []).length}`);
    console.log(`  - Atividades: ${(data.content.match(/Atividade/gi) || []).length}`);
  }
}
