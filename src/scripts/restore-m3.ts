import { contentM3Premium, questionsM3 } from "../lib/rebuild-m3.functions";

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
    .eq('slug', 'influenciador-ia-m3')
    .single();

  if (!mod) {
    console.error('Module M3 not found');
    process.exit(1);
  }

  console.log('Updating Module M3...');
  const { error: upErr } = await supabase
    .from('modules')
    .update({
      content_text: contentM3Premium,
      title: 'Módulo 3 — Criação da Identidade do Influenciador Virtual',
      content_type: 'text',
      video_url: null
    })
    .eq('id', mod.id);

  if (upErr) {
    console.error('Error updating module:', upErr);
    process.exit(1);
  }

  console.log('Updating Questions for M3...');
  await supabase.from('questions').delete().eq('module_id', mod.id);

  const newQuestions = questionsM3.map(q => ({
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
    console.log('M3 Premium Restored Successfully!');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
