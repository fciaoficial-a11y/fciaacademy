import { contentM12Premium, questionsM12 } from "../lib/rebuild-m12.functions";

async function getSupabase() {
  const { supabaseAdmin } = await import("../integrations/supabase/client.server");
  return supabaseAdmin;
}

async function restoreM12Premium() {
  console.log("🚀 Iniciando Produção Premium Isolada: Módulo 12...");
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
  const charCount = contentM12Premium.length;
  console.log(`📊 Densidade detectada: ${charCount} caracteres.`);

  if (charCount < 15000) {
    console.error(`❌ Erro: Densidade insuficiente (${charCount}). O padrão FCIA Premium exige >15k para o Módulo 12.`);
    process.exit(1);
  }

  const { data: mod } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', course.id)
    .eq('slug', targetSlug)
    .maybeSingle();

  if (!mod) {
    console.error(`❌ Erro: Módulo ${targetSlug} não encontrado.`);
    process.exit(1);
  }

  // ATOMIC UPDATE
  const { error: updateError } = await supabase
    .from('modules')
    .update({
      content_text: contentM12Premium,
      title: 'Módulo 12 — Projeto Final: Campanha Completa para TikTok Shop',
      content_type: 'text',
      video_url: null,
      is_published: false 
    })
    .eq('id', mod.id);

  if (updateError) {
    console.error("❌ Erro no update do módulo:", updateError.message);
    process.exit(1);
  }

  // QUESTIONS UPDATE
  await supabase.from('questions').delete().eq('module_id', mod.id);
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
    console.error("❌ Erro nas questões:", qError.message);
    process.exit(1);
  }

  console.log("✨ Módulo 12 RESTAURADO com padrão PREMIUM FCIA.");
  process.exit(0);
}

restoreM12Premium();
