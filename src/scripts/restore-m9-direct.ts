import { contentM9Premium, questionsM9 } from "../lib/rebuild-m9.functions";

async function run() {
  console.log("🚀 Iniciando restauração direta via Script do Módulo 9...");
  
  try {
    const { supabaseAdmin } = await import("../integrations/supabase/client.server");
    
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) {
      console.error("❌ Curso não encontrado.");
      process.exit(1);
    }
    const courseId = course.id;

    const { data: mod } = await supabaseAdmin
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('sort_order', 9)
      .maybeSingle();

    if (!mod) {
      console.error("❌ Módulo 9 não encontrado.");
      process.exit(1);
    }

    const { error: updateError } = await supabaseAdmin.from('modules').update({
      content_text: contentM9Premium,
      title: 'Módulo 9: Vitrine, Criativos e Apresentação de Produtos',
      content_type: 'text',
      video_url: null,
      is_published: false
    }).eq('id', mod.id);

    if (updateError) {
      console.error("❌ Erro no update do módulo:", updateError.message);
      process.exit(1);
    }

    await supabaseAdmin.from('questions').delete().eq('module_id', mod.id);
    
    const newQuestions = questionsM9.map(q => ({
      module_id: mod.id,
      course_id: courseId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty as any,
      status: 'approved',
      type: 'multiple_choice'
    }));

    const { error: insertError } = await supabaseAdmin.from('questions').insert(newQuestions);
    
    if (insertError) {
      console.error("❌ Erro ao inserir questões:", insertError.message);
      process.exit(1);
    }

    console.log("✅ Módulo 9 restaurado com sucesso (Versão PREMIUM).");
    process.exit(0);

  } catch (error) {
    console.error("💥 Erro fatal:", error);
    process.exit(1);
  }
}

run();
