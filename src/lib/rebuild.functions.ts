import { createServerFn } from "@tanstack/react-start";
import { contentM1Premium, questionsM1 } from "./rebuild-m1.functions.ts";
import { contentM2Premium, questionsM2 } from "./rebuild-m2.functions.ts";
import { contentM3Premium, questionsM3 } from "./rebuild-m3.functions.ts";
import { contentM4Premium, questionsM4 } from "./rebuild-m4.functions.ts";
import { contentM5Premium, questionsM5 } from "./rebuild-m5.functions.ts";
import { contentM6Premium, questionsM6 } from "./rebuild-m6.functions.ts";
import { contentM9Premium, questionsM9 } from "./rebuild-m9.functions.ts";
import { contentM10Premium, questionsM10 } from "./rebuild-m10.functions.ts";
import { contentM11Premium, questionsM11 } from "./rebuild-m11.functions.ts";


async function getSupabase() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Validação de proteção contra regressão para conteúdo Premium
 */
function validatePremiumContent(slug: string, content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: `Conteúdo para ${slug} está vazio ou ausente.` };
  }

  const charCount = content.length;
  const lineCount = content.split('\n').length;
  const h2Count = (content.match(/^## /gm) || []).length;
  
  // Regras específicas por módulo
  if (slug === 'influenciador-ia-m1') {
    if (charCount < 14000) return { valid: false, error: `Módulo 1: Conteúdo muito curto (${charCount} chars). Mínimo 14.000.` };
    if (lineCount < 200) return { valid: false, error: `Módulo 1: Poucas linhas (${lineCount}). Mínimo 200.` };
    if (!content.includes('## BLOCO 8') || !content.includes('prompts')) return { valid: false, error: `Módulo 1: Seção de prompts ausente.` };
    if (!content.includes('## BLOCO 9') || !content.includes('Materiais')) return { valid: false, error: `Módulo 1: Materiais complementares ausentes.` };
    if (!content.includes('PROJETO PRÁTICO')) return { valid: false, error: `Módulo 1: Projeto prático/checkpoint ausente.` };
    if (!content.includes('FECHAMENTO E TRANSIÇÃO')) return { valid: false, error: `Módulo 1: Fechamento ausente.` };
  }

  if (slug === 'modulo-2-estrategia-posicionamento') {
    if (charCount < 3000) return { valid: false, error: `Módulo 2: Conteúdo muito curto (${charCount} chars).` };
    if (h2Count < 10) return { valid: false, error: `Módulo 2: Estrutura incompleta (H2: ${h2Count}).` };
    if (!content.includes('MODO PROVA')) return { valid: false, error: `Módulo 2: Método PROVA ausente.` };
    if (!content.includes('DOSSIÊ ESTRATÉGICO')) return { valid: false, error: `Módulo 2: Dossiê Estratégico ausente.` };
  }

  if (slug === 'vitrine-criativos-tiktok-shop') {
    if (charCount < 10000) return { valid: false, error: `Módulo 9: Conteúdo muito curto (${charCount} chars).` };
    if (!content.includes('## BLOCO 12')) return { valid: false, error: `Módulo 9: Estrutura incompleta.` };
    if (!content.includes('FICHA COMERCIAL')) return { valid: false, error: `Módulo 9: Ficha comercial ausente.` };
  }
  
  if (slug === 'influenciador-ia-m10') {
    if (charCount < 10000) return { valid: false, error: `Módulo 10: Conteúdo muito curto (${charCount} chars).` };
    if (!content.includes('## BLOCO 12')) return { valid: false, error: `Módulo 10: Estrutura incompleta.` };
    if (!content.includes('PAINEL DE PUBLICAÇÃO')) return { valid: false, error: `Módulo 10: Painel de publicação ausente.` };
  }

  if (slug === 'influenciador-ia-m11') {
    if (charCount < 10000) return { valid: false, error: `Módulo 11: Conteúdo muito curto (${charCount} chars).` };
    if (!content.includes('## BLOCO 12')) return { valid: false, error: `Módulo 11: Estrutura incompleta.` };
    if (!content.includes('SISTEMA OPERACIONAL DE CONTEÚDO')) return { valid: false, error: `Módulo 11: SOC ausente.` };
  }

  return { valid: true };
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


export const restorePremiumModules1And2 = createServerFn({ method: "POST" })
  .handler(async () => {
    const supabase = await getSupabase();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) return { success: false, error: 'Course not found' };
    const courseId = course.id;

    const updates = [
      { 
        slug: 'influenciador-ia-m1', 
        content: contentM1Premium, 
        questions: questionsM1,
        title: 'Módulo 1: Mentalidade e Nichos Lucrativos' 
      },
      { 
        slug: 'modulo-2-estrategia-posicionamento', 
        content: contentM2Premium, 
        questions: questionsM2,
        title: 'Módulo 2: Estratégia e Posicionamento' 
      }
    ];

    const results = [];

    for (const up of updates) {
      // 1. Validar proteção contra regressão
      const validation = validatePremiumContent(up.slug, up.content);
      if (!validation.valid) {
        return { success: false, error: `Falha na validação de segurança: ${validation.error}` };
      }

      const { data: mod } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('slug', up.slug)
        .maybeSingle();

      if (mod) {
        // 2. Restaurar Módulo
        const { error: modError } = await supabase.from('modules').update({
          content_text: up.content,
          title: up.title,
          content_type: 'text',
          video_url: null,
          is_published: false // Garantir standby
        }).eq('id', mod.id);

        if (modError) throw new Error(`Erro ao atualizar módulo ${up.slug}: ${modError.message}`);

        // 3. Restaurar Questões
        await supabase.from('questions').delete().eq('module_id', mod.id);
        
        const inserts = up.questions.map(q => ({
          module_id: mod.id,
          course_id: courseId,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          difficulty: q.difficulty as any,
          status: 'approved',
          type: 'multiple_choice'
        }));

        const { error: qError } = await supabase.from('questions').insert(inserts);
        if (qError) throw new Error(`Erro ao inserir questões do módulo ${up.slug}: ${qError.message}`);
        
        results.push({ slug: up.slug, status: 'restored' });
      }
    }

    return { success: true, results };
  });

export const forceRebuildAllModules = createServerFn({ method: "POST" })
  .handler(async () => {
    // Agora a função global também utiliza as fontes premium e possui validação
    const supabase = await getSupabase();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) return { success: false, error: 'Course not found' };
    const courseId = course.id;

    const updates = [
      { slug: 'influenciador-ia-m1', content: contentM1Premium, title: 'Módulo 1: Mentalidade e Nichos Lucrativos', questions: questionsM1 },
      { slug: 'modulo-2-estrategia-posicionamento', content: contentM2Premium, title: 'Módulo 2: Estratégia e Posicionamento', questions: questionsM2 },
      { slug: 'influenciador-ia-m3', content: contentM3Premium, title: 'Módulo 3: Criação da Identidade do Influenciador', questions: questionsM3 },
      { slug: 'influenciador-ia-m4', content: contentM4Premium, title: 'Módulo 4: Consistência Visual', questions: questionsM4 },
      { slug: 'influenciador-ia-m5', content: contentM5Premium, title: 'Módulo 5: Produção de Imagens e Curadoria', questions: questionsM5 },
      { slug: 'influenciador-ia-m6', content: contentM6Premium, title: 'Módulo 6: Criação de Vídeos com Influenciador', questions: questionsM6 }
    ];

    for (const up of updates) {
      // Validação mandatória
      const v = validatePremiumContent(up.slug, up.content);
      if (!v.valid) throw new Error(`Regressão detectada em ${up.slug}: ${v.error}`);

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

        await supabase.from('questions').delete().eq('module_id', mod.id);
        
        const inserts = up.questions.map(q => ({
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
    }

    return { success: true };
  });


export const forceRebuildModule9 = createServerFn({ method: "POST" })
  .handler(async () => {
    const supabase = await getSupabase();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) return { success: false, error: 'Course not found' };
    const courseId = course.id;

    const v = validatePremiumContent('vitrine-criativos-tiktok-shop', contentM9Premium);
    if (!v.valid) return { success: false, error: v.error };

    const { data: mod } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('sort_order', 9)
      .maybeSingle();

    if (mod) {
      const { error: updateError } = await supabase.from('modules').update({
        content_text: contentM9Premium,
        title: 'Módulo 9: Vitrine, Criativos e Apresentação de Produtos',
        content_type: 'text',
        video_url: null,
        is_published: false
      }).eq('id', mod.id);

      if (updateError) return { success: false, error: updateError.message };

      await supabase.from('questions').delete().eq('module_id', mod.id);
      
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

      const { error: insertError } = await supabase.from('questions').insert(newQuestions);
      if (insertError) return { success: false, error: insertError.message };

      return { success: true };
    }
    return { success: false, error: 'Module not found' };
  });

export const forceRebuildModule10 = createServerFn({ method: "POST" })
  .handler(async () => {
    const supabase = await getSupabase();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) return { success: false, error: 'Course not found' };
    const courseId = course.id;

    // Slug exato do Módulo 10 identificado na auditoria
    const targetSlug = 'influenciador-ia-m10';

    const v = validatePremiumContent(targetSlug, contentM10Premium);
    if (!v.valid) return { success: false, error: v.error };

    const { data: mod } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('slug', targetSlug)
      .maybeSingle();

    if (mod) {
      const { error: updateError } = await supabase.from('modules').update({
        content_text: contentM10Premium,
        title: 'MÓDULO 10 — Estratégia de Publicação e Escala',
        content_type: 'text',
        video_url: null,
        is_published: false
      }).eq('id', mod.id);

      if (updateError) return { success: false, error: updateError.message };

      await supabase.from('questions').delete().eq('module_id', mod.id);
      
      const newQuestions = questionsM10.map(q => ({
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
