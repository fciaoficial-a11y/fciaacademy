import { supabase } from "./src/integrations/supabase/client";
import * as fs from 'fs';

async function fix() {
  const courseId = "e23cf598-23be-4dbe-b8f0-4c3a420d9b62"; // influenciador-ia-tiktok-shop
  
  // 1. Criar Módulos 1 e 2 se não existirem
  const missingModules = [
    { sort_order: 1, title: "MÓDULO 1 — TikTok Shop: O Oceano Azul da Monetização", slug: "modulo-1-mentalidade-nichos" },
    { sort_order: 2, title: "MÓDULO 2 — Branding e Posicionamento do Influenciador", slug: "modulo-2-estrategia-posicionamento" }
  ];

  for (const m of missingModules) {
    const { data: existing } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId)
      .eq("sort_order", m.sort_order)
      .maybeSingle();

    if (!existing) {
      console.log(`Criando Módulo ${m.sort_order}...`);
      await supabase.from("modules").insert({
        course_id: courseId,
        sort_order: m.sort_order,
        title: m.title,
        slug: m.slug,
        content_type: 'text',
        duration_minutes: 30
      });
    }
  }

  // 2. Agora restaurar o conteúdo de todos (1, 2, 4)
  const modulesToRestore = [
    { sort_order: 1, file: "docs/production/revisao-modulo-1.md" },
    { sort_order: 2, file: "docs/production/revisao-modulo-2.md" },
    { sort_order: 4, file: "docs/production/revisao-modulo-4.md" }
  ];

  for (const m of modulesToRestore) {
    const content = fs.readFileSync(m.file, 'utf-8');
    const { data: moduleData, error: modError } = await supabase
      .from("modules")
      .update({
        content_text: content,
        content_type: 'text',
        video_url: null
      })
      .eq("course_id", courseId)
      .eq("sort_order", m.sort_order)
      .select()
      .single();

    if (modError) {
      console.error(`Erro ao restaurar Módulo ${m.sort_order}:`, modError);
      continue;
    }

    console.log(`Módulo ${m.sort_order} restaurado.`);

    // Quiz simples para os restaurados
    await supabase.from("questions").delete().eq("module_id", moduleData.id);
    await supabase.from("questions").insert([
      {
        module_id: moduleData.id,
        question_text: `De acordo com o conteúdo do Módulo ${m.sort_order}, qual o foco principal para o sucesso no TikTok Shop?`,
        options: ["Estratégia, Dados e Posicionamento", "Apenas estética visual", "Sorte no algoritmo", "Quantidade sobre qualidade"],
        correct_option_index: 0,
        status: 'approved'
      }
    ]);
  }
}

fix();
