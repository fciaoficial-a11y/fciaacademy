import { contentM6Premium, questionsM6 } from "../lib/rebuild-m6.functions";

async function main() {
  const { supabaseAdmin: supabase } = await import("../integrations/supabase/client.server");

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'influenciador-ia-tiktok-shop')
    .single();

  if (!course) {
    console.error('Course not found');
    process.exit(1);
  }

  const { data: mod } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', course.id)
    .eq('slug', 'influenciador-ia-m6')
    .single();

  if (!mod) {
    console.error('Module M6 not found. Trying to create it...');
    // Se não existir, podemos tentar buscar pela ordem ou criar, mas o slug deve existir se foi semeado no Sprint 0
    process.exit(1);
  }

  console.log('Updating Module M6...');
  const { error: upErr } = await supabase
    .from('modules')
    .update({
      content_text: contentM6Premium,
      title: 'Módulo 6 — Criação de Vídeos com Influenciador Virtual',
      content_type: 'text',
      video_url: null
    })
    .eq('id', mod.id);

  if (upErr) {
    console.error('Error updating module:', upErr);
    process.exit(1);
  }

  console.log('Updating Questions for M6...');
  await supabase.from('questions').delete().eq('module_id', mod.id);

  const newQuestions = questionsM6.map(q => ({
    module_id: mod.id,
    course_id: course.id,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    difficulty: q.difficulty,
    status: 'approved',
    type: 'multiple_choice'
  }));

  const { error: qErr } = await supabase.from('questions').insert(newQuestions);
  if (qErr) {
    console.error('Error inserting questions:', qErr);
    process.exit(1);
  } else {
    console.log('M6 Premium Restored Successfully!');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
