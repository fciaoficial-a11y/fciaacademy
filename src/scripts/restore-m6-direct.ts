import { supabaseAdmin as supabase } from "@/integrations/supabase/client.server";
import { contentM6Premium, questionsM6 } from "../lib/rebuild-m6.functions.ts";

async function main() {
  console.log("Iniciando injeção direta do Módulo 6 Premium...");
  try {
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) {
      console.error("Curso não encontrado.");
      process.exit(1);
    }
    const courseId = course.id;

    const { data: mod } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('slug', 'influenciador-ia-m6')
      .maybeSingle();

    if (!mod) {
      console.error("Módulo não encontrado.");
      process.exit(1);
    }

    const { error: updateError } = await supabase.from('modules').update({
      content_text: contentM6Premium,
      title: 'Módulo 6: Criação de Vídeos com Influenciador',
      content_type: 'text',
      video_url: null
    }).eq('id', mod.id);

    if (updateError) {
      console.error("Erro ao atualizar módulo:", updateError.message);
      process.exit(1);
    }

    await supabase.from('questions').delete().eq('module_id', mod.id);
    
    const newQuestions = questionsM6.map(q => ({
      module_id: mod.id,
      course_id: courseId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty as any,
      status: 'approved',
      type: 'multiple_choice'
    }));

    const { error: insertError } = await supabase.from('questions').insert(newQuestions);
    if (insertError) {
      console.error("Erro ao inserir questões:", insertError.message);
      process.exit(1);
    }

    console.log("Módulo 6 injetado com sucesso via script direto.");
  } catch (error) {
    console.error("Falha fatal na execução do script:", error);
    process.exit(1);
  }
}

main();
