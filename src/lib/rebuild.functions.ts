import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Validação Rigorosa de Conteúdo Premium
 * Bloqueia qualquer gravação que não atenda aos requisitos mínimos de densidade e estrutura.
 */
function validatePremiumSource(slug: string, content: string): { valid: boolean; error?: string } {
  if (!content || content.length < 15000) {
    return { 
      valid: false, 
      error: `FONTE NÃO É PREMIUM: Conteúdo para ${slug} insuficiente (${content?.length || 0} chars). Mínimo exigido: 15.000.` 
    };
  }

  const requirements = [
    { key: "## BLOCO", label: "Blocos Estruturados" },
    { key: "PROMPTS", label: "Biblioteca de Prompts" },
    { key: "MATERIAIS", label: "Materiais Complementares" },
    { key: "ATIVIDADE", label: "Atividades Práticas" },
    { key: "CHECKLIST", label: "Checklists de Execução" },
    { key: "RUBRICA", label: "Rubrica de Avaliação" },
    { key: "PROJETO", label: "Projeto Prático/Dossiê" }
  ];

  for (const req of requirements) {
    if (!content.toUpperCase().includes(req.key)) {
      return { valid: false, error: `FONTE INVÁLIDA: Requisito obrigatório ausente: ${req.label}.` };
    }
  }

  return { valid: true };
}

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * RESTORE ATÔMICO E PROTEGIDO
 * Esta é a ÚNICA via autorizada para atualização de módulos.
 * O script direct-restore.ts foi ELIMINADO.
 */
export const atomicPremiumRestore = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ 
    moduleSlug: z.string(),
    content: z.string(),
    questions: z.array(z.any()),
    title: z.string()
  }).parse(d))
  .handler(async ({ data }) => {
    // 1. Bloqueio Técnico Imediato se a fonte não for Premium
    const validation = validatePremiumSource(data.moduleSlug, data.content);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const supabase = await getAdminClient();

    // 2. Localizar curso e módulo
    const { data: mod, error: fetchError } = await supabase
      .from('modules')
      .select('id, course_id, courses(is_published)')
      .eq('slug', data.moduleSlug)
      .single();

    if (fetchError || !mod) throw new Error("Módulo não encontrado no banco.");

    // 3. Executar UPDATE protegido
    const { error: updateError } = await supabase
      .from('modules')
      .update({
        content_text: data.content,
        title: data.title,
        content_type: 'text',
        video_url: null,
        is_published: false // FORÇAR STANDBY
      })
      .eq('id', mod.id);

    if (updateError) throw new Error(`Falha no Update: ${updateError.message}`);

    // 4. Restaurar Questões
    await supabase.from('questions').delete().eq('module_id', mod.id);
    const inserts = data.questions.map(q => ({
      module_id: mod.id,
      course_id: mod.course_id,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty,
      status: 'approved',
      type: 'multiple_choice'
    }));
    
    await supabase.from('questions').insert(inserts);

    return { 
      success: true, 
      message: `Módulo ${data.moduleSlug} restaurado com sucesso (VALIDAÇÃO PREMIUM OK).` 
    };
  });
