import { createServerFn } from "@tanstack/react-start";
import { contentM8Premium, questionsM8 } from "../lib/rebuild-m8.functions";

async function getSupabase() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const injectModule8 = createServerFn({ method: "POST" })
  .handler(async () => {
    const supabase = await getSupabase();

    // 1. Identificar curso
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) throw new Error('Course not found');
    const courseId = course.id;

    // 2. Identificar registro do Módulo 8 (slug fixo para segurança)
    const { data: mod } = await supabase
      .from('modules')
      .select('id, slug, title')
      .eq('course_id', courseId)
      .eq('slug', 'influenciador-ia-m8') // Assumindo slug sequencial
      .maybeSingle();

    if (!mod) {
       // Tentar buscar pela ordem se o slug for diferente
       const { data: modByOrder } = await supabase
        .from('modules')
        .select('id, slug, title')
        .eq('course_id', courseId)
        .eq('sort_order', 8)
        .maybeSingle();
        
       if (!modByOrder) throw new Error('Module 8 record not found in database. Create it via admin first or seed script.');
       
       // Proceder com o ID encontrado pela ordem
       return await performInjection(supabase, modByOrder.id, courseId);
    }

    return await performInjection(supabase, mod.id, courseId);
  });

async function performInjection(supabase: any, moduleId: string, courseId: string) {
  // Escrita EXCLUSIVA no Módulo 8
  const { error: updateError } = await supabase.from('modules').update({
    content_text: contentM8Premium,
    title: 'Módulo 8: Roteiros de Conteúdo e Vídeos que Vendem',
    content_type: 'text',
    video_url: null,
    slug: 'influenciador-ia-m8' // Padronizando slug
  }).eq('id', moduleId);

  if (updateError) throw new Error(`Update error: ${updateError.message}`);

  // Limpar e reinserir questões apenas deste módulo
  await supabase.from('questions').delete().eq('module_id', moduleId);
  
  const inserts = questionsM8.map(q => ({
    module_id: moduleId,
    course_id: courseId,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    difficulty: q.difficulty as any,
    status: 'approved',
    type: 'multiple_choice'
  }));

  const { error: qError } = await supabase.from('questions').insert(inserts);
  if (qError) throw new Error(`Questions error: ${qError.message}`);

  return { success: true, moduleId };
}
