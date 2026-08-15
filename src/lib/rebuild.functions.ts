import { createServerFn } from "@tanstack/react-start";
import { contentM3Premium, questionsM3 } from "./rebuild-m3.functions.ts";
import { contentM4Premium, questionsM4 } from "./rebuild-m4.functions.ts";
import { contentM5Premium, questionsM5 } from "./rebuild-m5.functions.ts";
import { contentM6Premium, questionsM6 } from "./rebuild-m6.functions.ts";

async function getSupabase() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const forceRebuildModule6 = createServerFn({ method: "POST" })
  .handler(async () => {
    const supabase = await getSupabase();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) return { success: false, error: 'Course not found' };
    const courseId = course.id;

    const { data: mod } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('slug', 'influenciador-ia-m6')
      .maybeSingle();

    if (mod) {
      const { error: updateError } = await supabase.from('modules').update({
        content_text: contentM6Premium,
        title: 'Módulo 6: Criação de Vídeos com Influenciador',
        content_type: 'text',
        video_url: null
      }).eq('id', mod.id);

      if (updateError) return { success: false, error: updateError.message };

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
      if (insertError) return { success: false, error: insertError.message };

      return { success: true };
    }
    return { success: false, error: 'Module not found' };
  });

export const forceRebuildAllModules = createServerFn({ method: "POST" })
  .handler(async () => {
    const supabase = await getSupabase();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) return { success: false, error: 'Course not found' };
    const courseId = course.id;

    const contentM1 = `...`; // Placeholder para brevidade
    const contentM2 = `...`; // Placeholder para brevidade

    const updates = [
      { slug: 'influenciador-ia-m3', content: contentM3Premium, title: 'Módulo 3: Criação da Identidade do Influenciador' },
      { slug: 'influenciador-ia-m4', content: contentM4Premium, title: 'Módulo 4: Consistência Visual' },
      { slug: 'influenciador-ia-m5', content: contentM5Premium, title: 'Módulo 5: Produção de Imagens e Curadoria' },
      { slug: 'influenciador-ia-m6', content: contentM6Premium, title: 'Módulo 6: Criação de Vídeos com Influenciador' }
    ];

    for (const up of updates) {
      const { data: mod } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('slug', up.slug)
        .maybeSingle();

      if (mod) {
        await supabase.from('modules').update({
          content_text: up.content,
          title: up.title,
          content_type: 'text',
          video_url: null
        }).eq('id', mod.id);
      }
    }

    return { success: true };
  });
