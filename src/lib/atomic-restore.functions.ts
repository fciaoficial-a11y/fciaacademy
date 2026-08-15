import { createServerFn } from "@tanstack/react-start";
import { contentM3Premium, questionsM3 } from "./rebuild-m3.functions.ts";
import { contentM4Premium, questionsM4 } from "./rebuild-m4.functions.ts";
import { contentM5Premium, questionsM5 } from "./rebuild-m5.functions.ts";
import { contentM8Premium, questionsM8 } from "./rebuild-m8.functions.ts";
import { contentM11Premium, questionsM11 } from "./rebuild-m11.functions.ts";

async function getSupabase() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function validateDensity(slug: string, content: string): { valid: boolean; error?: string } {
  const charCount = content.trim().length;
  const blockCount = (content.match(/^## /gm) || []).length;
  
  if (slug === 'influenciador-ia-m3') {
    if (charCount < 15000) return { valid: false, error: `M3: ${charCount} chars (min 15k)` };
    if (blockCount < 12) return { valid: false, error: `M3: ${blockCount} blocks (min 12)` };
    if (!content.includes('Ficha-Mestra')) return { valid: false, error: 'M3: Ficha-Mestra ausente' };
  }
  if (slug === 'influenciador-ia-m4') {
    if (charCount < 15000) return { valid: false, error: `M4: ${charCount} chars (min 15k)` };
    if (blockCount < 12) return { valid: false, error: `M4: ${blockCount} blocks (min 12)` };
    if (!content.includes('Sistema Visual-Mestre')) return { valid: false, error: 'M4: Sistema Visual-Mestre ausente' };
  }
  if (slug === 'influenciador-ia-m5') {
    if (charCount < 15000) return { valid: false, error: `M5: ${charCount} chars (min 15k)` };
    if (blockCount < 12) return { valid: false, error: `M5: ${blockCount} blocks (min 12)` };
    if (!content.includes('Biblioteca Comercial de Ativos')) return { valid: false, error: 'M5: Biblioteca ausente' };
  }
  if (slug === 'influenciador-ia-m8') {
    if (charCount < 16000) return { valid: false, error: `M8: ${charCount} chars (min 16k)` };
    if (blockCount < 12) return { valid: false, error: `M8: ${blockCount} blocks (min 12)` };
    if (!content.includes('Biblioteca Mestra de Roteiros')) return { valid: false, error: 'M8: Biblioteca ausente' };
  }
  if (slug === 'influenciador-ia-m11') {
    if (charCount < 16000) return { valid: false, error: `M11: ${charCount} chars (min 16k)` };
    if (blockCount < 12) return { valid: false, error: `M11: ${blockCount} blocks (min 12)` };
    if (!content.includes('SISTEMA OPERACIONAL DE CONTEÚDO')) return { valid: false, error: 'M11: SOC ausente' };
  }
  return { valid: true };
}

export const restoreAtomicM3M4M5M8M11 = createServerFn({ method: "POST" })
  .handler(async () => {
    const supabase = await getSupabase();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) return { success: false, error: 'Course not found' };
    const courseId = course.id;

    const targets = [
      { slug: 'influenciador-ia-m3', content: contentM3Premium, questions: questionsM3, title: 'Módulo 3: Criação da Identidade do Influenciador' },
      { slug: 'influenciador-ia-m4', content: contentM4Premium, questions: questionsM4, title: 'Módulo 4: Consistência Visual' },
      { slug: 'influenciador-ia-m5', content: contentM5Premium, questions: questionsM5, title: 'Módulo 5: Produção de Imagens e Curadoria' },
      { slug: 'influenciador-ia-m8', content: contentM8Premium, questions: questionsM8, title: 'Módulo 8: Roteiros de Conteúdo e Vídeos que Vendem' },
      { slug: 'influenciador-ia-m11', content: contentM11Premium, questions: questionsM11, title: 'Módulo 11: Operação, Escala e Biblioteca de Conteúdos' }
    ];

    // Phase 1: Pre-validation
    for (const t of targets) {
      const v = validateDensity(t.slug, t.content);
      if (!v.valid) throw new Error(`Falha na validação pré-restauração para ${t.slug}: ${v.error}`);
    }

    // Phase 2: Atomic Restore
    const results = [];
    for (const t of targets) {
      const { data: mod } = await supabase
        .from('modules')
        .select('id, content_text')
        .eq('course_id', courseId)
        .eq('slug', t.slug)
        .maybeSingle();

      if (!mod) throw new Error(`Módulo não encontrado: ${t.slug}`);

      const charsBefore = mod.content_text?.length || 0;

      // Update module
      const { error: modError } = await supabase.from('modules').update({
        content_text: t.content,
        title: t.title,
        content_type: 'text',
        video_url: null,
        is_published: false
      }).eq('id', mod.id);

      if (modError) throw new Error(`Erro ao restaurar ${t.slug}: ${modError.message}`);

      // Update questions
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
      const { error: qError } = await supabase.from('questions').insert(inserts);
      if (qError) throw new Error(`Erro ao restaurar questões de ${t.slug}: ${qError.message}`);

      results.push({
        slug: t.slug,
        charsBefore,
        charsAfter: t.content.length,
        status: 'restored'
      });
    }

    return { success: true, results };
  });
