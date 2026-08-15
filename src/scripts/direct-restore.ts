import { contentM3Premium, questionsM3 } from "./rebuild-m3.functions.ts";
import { contentM4Premium, questionsM4 } from "./rebuild-m4.functions.ts";
import { contentM5Premium, questionsM5 } from "./rebuild-m5.functions.ts";
import { contentM8Premium, questionsM8 } from "./rebuild-m8.functions.ts";
import { contentM11Premium, questionsM11 } from "./rebuild-m11.functions.ts";

async function getSupabase() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function runDirectRestore() {
  const supabase = await getSupabase();
  const courseSlug = 'influenciador-ia-tiktok-shop';

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single();

  if (!course) {
    console.error("Course not found");
    return;
  }
  const courseId = course.id;

  const targets = [
    { slug: 'influenciador-ia-m3', content: contentM3Premium, questions: questionsM3, title: 'Módulo 3 — Criação da Identidade do Influenciador Virtual' },
    { slug: 'influenciador-ia-m4', content: contentM4Premium, questions: questionsM4, title: 'Módulo 4 — Consistência Visual, Ficha Técnica e Biblioteca de Identidade' },
    { slug: 'influenciador-ia-m5', content: contentM5Premium, questions: questionsM5, title: 'Módulo 5 — Produção de Imagens em Escala e Curadoria de Ativos' },
    { slug: 'influenciador-ia-m8', content: contentM8Premium, questions: questionsM8, title: 'Módulo 8 — Roteiros de Conteúdo e Vídeos que Vendem' },
    { slug: 'influenciador-ia-m11', content: contentM11Premium, questions: questionsM11, title: 'Módulo 11 — Operação, Escala e Biblioteca de Conteúdos' }
  ];

  console.log(`Starting direct restore for course ${courseId}...`);

  for (const t of targets) {
    console.log(`Restoring ${t.slug}...`);
    
    const { data: mod } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('slug', t.slug)
      .maybeSingle();

    if (!mod) {
      console.warn(`Module ${t.slug} not found in DB`);
      continue;
    }

    // Update module
    const { error: modError } = await supabase.from('modules').update({
      content_text: t.content,
      title: t.title,
      content_type: 'text',
      video_url: null,
      is_published: false
    }).eq('id', mod.id);

    if (modError) {
      console.error(`Error updating ${t.slug}:`, modError);
      continue;
    }

    // Update questions
    await supabase.from('questions').delete().eq('module_id', mod.id);
    const inserts = t.questions.map(q => ({
      module_id: mod.id,
      course_id: courseId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty,
      status: 'approved',
      type: 'multiple_choice'
    }));
    const { error: qError } = await supabase.from('questions').insert(inserts);
    if (qError) {
      console.error(`Error inserting questions for ${t.slug}:`, qError);
    }
    
    console.log(`Done with ${t.slug} (${t.content.length} chars)`);
  }
}

// Execution
runDirectRestore().then(() => console.log("Direct restore finished."));
