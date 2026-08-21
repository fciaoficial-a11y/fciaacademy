
import { contentM9Premium, questionsM9 } from "./src/lib/rebuild-m9.functions.ts";
import { supabaseAdmin } from "./src/integrations/supabase/client.server";

async function run() {
  console.log("INICIANDO RESTAURAÇÃO ATÔMICA MANUAL — MÓDULO 9");
  
  const moduleSlug = "influenciador-ia-m9";
  const content = contentM9Premium;
  const questions = questionsM9;
  const title = "Módulo 9: Vitrine, Criativos e Apresentação de Produtos";

  // 1. Validação Manual (Espelhada do rebuild.functions.ts)
  if (!content || content.length < 15000) {
    throw new Error(`FONTE NÃO É PREMIUM: Mínimo 15k chars.`);
  }

  // 2. Localizar curso e módulo
  const { data: mod, error: fetchError } = await supabaseAdmin
    .from('modules')
    .select('id, course_id')
    .eq('slug', moduleSlug)
    .single();

  if (fetchError || !mod) throw new Error("Módulo não encontrado no banco.");

  // 3. Executar UPDATE
  const { error: updateError } = await supabaseAdmin
    .from('modules')
    .update({
      content_text: content,
      title: title,
      content_type: 'text',
      video_url: null,
      is_published: false
    })
    .eq('id', mod.id);

  if (updateError) throw new Error(`Falha no Update: ${updateError.message}`);

  // 4. Restaurar Questões
  await supabaseAdmin.from('questions').delete().eq('module_id', mod.id);
  const inserts = questions.map(q => ({
    module_id: mod.id,
    course_id: mod.course_id,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    difficulty: q.difficulty,
    status: 'approved',
    type: 'multiple_choice'
  }));
  
  await supabaseAdmin.from('questions').insert(inserts);

  console.log("MÓDULO 9 RESTAURADO COM SUCESSO NO BANCO.");
}

run().catch(console.error);
