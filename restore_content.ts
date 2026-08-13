import { supabase } from "./src/integrations/supabase/client";
import * as fs from 'fs';

async function restore() {
  const courseSlug = "influenciador-ia-tiktok-shop";
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (!course) {
    console.error("Curso não encontrado");
    return;
  }

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
      .eq("course_id", course.id)
      .eq("sort_order", m.sort_order)
      .select()
      .single();

    if (modError) {
      console.error(`Erro ao restaurar Módulo ${m.sort_order}:`, modError);
      continue;
    }

    console.log(`Módulo ${m.sort_order} restaurado com sucesso.`);

    // Limpar perguntas antigas e inserir novas baseadas no conteúdo (exemplo simplificado)
    await supabase.from("questions").delete().eq("module_id", moduleData.id);
    
    // Inserindo perguntas básicas para garantir que o quiz funcione
    const questions = [
      {
        module_id: moduleData.id,
        question_text: `Qual o foco principal do Módulo ${m.sort_order}?`,
        options: ["Estratégia e Dados", "Apenas Estética", "Sorte", "Copiar outros"],
        correct_option_index: 0,
        status: 'approved'
      }
    ];

    await supabase.from("questions").insert(questions);
  }
}

restore();
