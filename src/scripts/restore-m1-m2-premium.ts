import { contentM1Premium, questionsM1 } from "../lib/rebuild-m1.functions.ts";
import { contentM2Premium, questionsM2 } from "../lib/rebuild-m2.functions.ts";

async function getSupabase() {
  const { supabaseAdmin } = await import("../integrations/supabase/client.server");
  return supabaseAdmin;
}

function validatePremiumContent(slug: string, content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: `Conteúdo para ${slug} está vazio ou ausente.` };
  }

  const charCount = content.length;
  const lineCount = content.split('\n').length;
  const h2Count = (content.match(/^## /gm) || []).length;
  
  if (slug === 'influenciador-ia-m1') {
    if (charCount < 14000) return { valid: false, error: `Módulo 1: Conteúdo muito curto (${charCount} chars). Mínimo 14.000.` };
    if (lineCount < 200) return { valid: false, error: `Módulo 1: Poucas linhas (${lineCount}). Mínimo 200.` };
  }

  if (slug === 'modulo-2-estrategia-posicionamento') {
    if (charCount < 3000) return { valid: false, error: `Módulo 2: Conteúdo muito curto (${charCount} chars).` };
    if (h2Count < 10) return { valid: false, error: `Módulo 2: Estrutura incompleta (H2: ${h2Count}).` };
  }

  return { valid: true };
}

async function main() {
  console.log("🚀 Iniciando Restauração Controlada dos Módulos 1 e 2 via Script Direto...");
  
  try {
    const supabase = await getSupabase();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'influenciador-ia-tiktok-shop')
      .single();

    if (!course) throw new Error('Course not found');
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

    const finalResults = [];

    for (const up of updates) {
      console.log(`Verificando ${up.slug}...`);
      const validation = validatePremiumContent(up.slug, up.content);
      if (!validation.valid) {
        throw new Error(`Falha na validação de segurança: ${validation.error}`);
      }

      const { data: mod } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('slug', up.slug)
        .maybeSingle();

      if (mod) {
        console.log(`Restaurando ${up.slug} (ID: ${mod.id})...`);
        const { error: modError } = await supabase.from('modules').update({
          content_text: up.content,
          title: up.title,
          content_type: 'text',
          video_url: null,
          is_published: false
        }).eq('id', mod.id);

        if (modError) throw new Error(`Erro ao atualizar módulo ${up.slug}: ${modError.message}`);

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
        
        finalResults.push({ slug: up.slug, status: 'restored' });
      } else {
        console.warn(`Aviso: Módulo ${up.slug} não encontrado no banco.`);
      }
    }

    console.log("✅ Restauração concluída com sucesso!");
    console.log("Relatório:", JSON.stringify(finalResults, null, 2));

  } catch (error) {
    console.error("💥 Erro fatal durante a execução:", error);
    process.exit(1);
  }
}

main();

