import { contentM11Premium, questionsM11 } from "../lib/rebuild-m11.functions";

async function getSupabase() {
  const { supabaseAdmin } = await import("../integrations/supabase/client.server");
  return supabaseAdmin;
}

async function restoreM11() {
  console.log("🚀 Iniciando restauração do Módulo 11 (Premium)...");
  const supabase = await getSupabase();

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'influenciador-ia-tiktok-shop')
    .single();

  if (!course) {
    console.error("❌ Erro: Curso não encontrado.");
    process.exit(1);
  }

  const targetSlug = 'influenciador-ia-m11';

  // Buscar módulo exato
  const { data: mod } = await supabase
    .from('modules')
    .select('id, sort_order')
    .eq('course_id', course.id)
    .eq('slug', targetSlug)
    .maybeSingle();

  if (!mod) {
    console.error(`❌ Erro: Módulo com slug ${targetSlug} não encontrado.`);
    process.exit(1);
  }

  console.log(`✅ Módulo encontrado: ID ${mod.id}, Ordem ${mod.sort_order}`);

  // 1. Atualizar conteúdo do módulo
  const { error: updateError } = await supabase
    .from('modules')
    .update({
      content_text: contentM11Premium,
      title: 'Módulo 11: Operação, Escala e Biblioteca de Conteúdos',
      content_type: 'text',
      video_url: null,
      is_published: false
    })
    .eq('id', mod.id);

  if (updateError) {
    console.error("❌ Ered ao atualizar conteúdo:", updateError.message);
    process.exit(1);
  }

  // 2. Limpar questões antigas
  await supabase.from('questions').delete().eq('module_id', mod.id);

  // 3. Inserir novas questões
  const inserts = questionsM11.map(q => ({
    module_id: mod.id,
    course_id: course.id,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    difficulty: q.difficulty as any,
    status: 'approved',
    type: 'multiple_choice'
  }));

  const { error: qError } = await supabase.from('questions').insert(inserts);
  if (qError) {
    console.error("❌ Erro ao inserir questões:", qError.message);
    process.exit(1);
  }

  console.log("✨ Módulo 11 Premium restaurado com sucesso!");
  process.exit(0);
}

restoreM11();
