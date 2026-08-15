
import { createServerFn } from "@tanstack/react-start";
import { contentM3Premium, questionsM3 } from "../lib/rebuild-m3.functions.ts";
import { contentM4Premium, questionsM4 } from "../lib/rebuild-m4.functions.ts";
import { contentM5Premium, questionsM5 } from "../lib/rebuild-m5.functions.ts";
import { contentM8Premium, questionsM8 } from "../lib/rebuild-m8.functions.ts";
import { contentM11Premium, questionsM11 } from "../lib/rebuild-m11.functions.ts";

async function getSupabase() {
  const { supabaseAdmin } = await import("../integrations/supabase/client.server");
  return supabaseAdmin;
}

async function run() {
  console.log("Iniciando Restauração Atômica Direta (M3, M4, M5, M8, M11)...");
  try {
    const supabase = await getSupabase();
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) throw new Error('Course not found');
    const courseId = course.id;

    const targets = [
      { slug: 'influenciador-ia-m3', content: contentM3Premium, questions: questionsM3, title: 'Módulo 3: Criação da Identidade do Influenciador' },
      { slug: 'influenciador-ia-m4', content: contentM4Premium, questions: questionsM4, title: 'Módulo 4: Consistência Visual' },
      { slug: 'influenciador-ia-m5', content: contentM5Premium, questions: questionsM5, title: 'Módulo 5: Produção de Imagens e Curadoria' },
      { slug: 'influenciador-ia-m8', content: contentM8Premium, questions: questionsM8, title: 'Módulo 8: Roteiros de Conteúdo e Vídeos que Vendem' },
      { slug: 'influenciador-ia-m11', content: contentM11Premium, questions: questionsM11, title: 'Módulo 11: Operação, Escala e Biblioteca de Conteúdos' }
    ];

    for (const t of targets) {
      console.log(`Restaurando ${t.slug}...`);
      const { data: mod } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('slug', t.slug)
        .maybeSingle();

      if (!mod) throw new Error(`Módulo não encontrado: ${t.slug}`);

      await supabase.from('modules').update({
        content_text: t.content,
        title: t.title,
        content_type: 'text',
        video_url: null,
        is_published: false
      }).eq('id', mod.id);

      await supabase.from('questions').delete().eq('module_id', mod.id);
      const inserts = t.questions.map(q => ({
        module_id: mod.id,
        course_id: courseId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty as any,
        status: 'approved',
        type: 'multiple_choice'
      }));
      await supabase.from('questions').insert(inserts);
    }
    console.log("SUCESSO: Todos os módulos restaurados.");
  } catch (e: any) {
    console.error("ERRO FATAL:", e.message);
    process.exit(1);
  }
}

run();
