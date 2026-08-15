import { contentM12Premium, questionsM12 } from "../lib/rebuild-m12.functions";

async function getSupabase() {
  const { supabaseAdmin } = await import("../integrations/supabase/client.server");
  return supabaseAdmin;
}

async function restoreM12() {
  console.log("🚀 Iniciando produção do Módulo 12 (Projeto Final - Premium)...");
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

  const targetSlug = 'influenciador-ia-m12';

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
      content_text: contentM12Premium,
      title: 'Módulo 12 — Projeto Final: Campanha Completa para TikTok Shop',
      content_type: 'text',
      video_url: null,
      is_published: false // Manter em standby
    })
    .eq('id', mod.id);

  if (updateError) {
    console.error("❌ Erro ao atualizar conteúdo:", updateError.message);
    process.exit(1);
  }

  // 2. Limpar questões antigas
  await supabase.from('questions').delete().eq('module_id', mod.id);

  // 3. Inserir novas questões
  const inserts = questionsM12.map(q => ({
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

  console.log("✨ Módulo 12 Premium produzido com sucesso!");
  process.exit(0);
}

restoreM12();
