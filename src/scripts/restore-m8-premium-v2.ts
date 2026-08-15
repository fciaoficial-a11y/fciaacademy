
import { contentM8Premium, questionsM8 } from "../lib/rebuild-m8.functions";

async function restoreM8() {
  const { supabaseAdmin } = await import("../integrations/supabase/client.server");
  
  console.log("Iniciando restauração premium do Módulo 8...");

  // 1. Localizar curso
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('slug', 'influenciador-ia-tiktok-shop')
    .single();

  if (!course) {
    console.error("Erro: Curso não encontrado.");
    return;
  }

  // 2. Localizar módulo 8
  const { data: mod } = await supabaseAdmin
    .from('modules')
    .select('id, title')
    .eq('course_id', course.id)
    .eq('sort_order', 8) // Módulo 8
    .maybeSingle();

  if (!mod) {
    console.error("Erro: Módulo 8 não encontrado.");
    return;
  }

  console.log(`Atualizando módulo: ${mod.title} (ID: ${mod.id})`);

  // 3. Atualizar conteúdo
  const { error: updateError } = await supabaseAdmin
    .from('modules')
    .update({
      content_text: contentM8Premium,
      content_type: 'text',
      video_url: null,
      is_published: false // Standby
    })
    .eq('id', mod.id);

  if (updateError) {
    console.error("Erro ao atualizar módulo:", updateError.message);
    return;
  }

  // 4. Atualizar questões
  console.log("Limpando questões antigas...");
  await supabaseAdmin.from('questions').delete().eq('module_id', mod.id);

  console.log(`Inserindo ${questionsM8.length} novas questões...`);
  const inserts = questionsM8.map(q => ({
    module_id: mod.id,
    course_id: course.id,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    difficulty: q.difficulty,
    status: 'approved',
    type: 'multiple_choice'
  }));

  const { error: qError } = await supabaseAdmin.from('questions').insert(inserts);
  if (qError) {
    console.error("Erro ao inserir questões:", qError.message);
    return;
  }

  console.log("SUCESSO: Módulo 8 restaurado com profundidade premium.");
}

restoreM8().catch(console.error);
