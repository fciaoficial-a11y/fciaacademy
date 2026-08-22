
import { supabaseAdmin } from './integrations/supabase/client.server';
import { jsPDF } from 'jspdf';
import fs from 'fs';

async function exportCourseAudit() {
  const courseSlug = 'influenciador-ia-tiktok-shop';
  console.log(`Iniciando auditoria para o curso: ${courseSlug}`);

  // 1. Buscar dados do curso
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('*, tracks(name)')
    .eq('slug', courseSlug)
    .single();

  if (courseError || !course) {
    console.error('Erro ao buscar curso:', courseError);
    return;
  }

  // 2. Buscar módulos ordenados
  const { data: modules, error: modulesError } = await supabaseAdmin
    .from('modules')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  if (modulesError || !modules) {
    console.error('Erro ao buscar módulos:', modulesError);
    return;
  }

  let fullContent = `CÓPIA DE AUDITORIA — NÃO É FONTE DE RESTAURAÇÃO\n\n`;
  fullContent += `CURSO: ${course.title}\n`;
  fullContent += `SLUG: ${course.slug}\n`;
  fullContent += `STATUS: ${course.is_published ? 'Publicado' : 'Standby/Draft'}\n`;
  fullContent += `PREÇO: R$ ${course.price}\n`;
  fullContent += `TRILHA: ${course.tracks?.name || 'N/A'}\n\n`;

  fullContent += `ÍNDICE DE MÓDULOS\n`;
  fullContent += `--------------------------------------------------------------------------------\n`;
  fullContent += `Mód. | Título | Caracteres | Palavras | Linhas | Video URL\n`;
  fullContent += `--------------------------------------------------------------------------------\n`;

  const moduleDetails = [];
  let totalChars = 0;

  for (const m of modules) {
    const text = m.content_text || '';
    const prompts = JSON.stringify(m.prompts || [], null, 2);
    const materials = JSON.stringify(m.materials || [], null, 2);
    const activities = JSON.stringify(m.activities || [], null, 2);
    const questions = JSON.stringify(m.questions || [], null, 2);
    
    const combined = `${text}\n\nPROMPTS:\n${prompts}\n\nMATERIAIS:\n${materials}\n\nATIVIDADES:\n${activities}`;
    const chars = combined.length;
    const words = combined.split(/\s+/).filter(Boolean).length;
    const lines = combined.split('\n').length;
    totalChars += chars;

    fullContent += `${String(m.order_index).padEnd(4)} | ${m.title.substring(0, 30).padEnd(30)} | ${String(chars).padEnd(10)} | ${String(words).padEnd(8)} | ${String(lines).padEnd(6)} | ${m.video_url || 'N/A'}\n`;
    
    moduleDetails.push({
      index: m.order_index,
      title: m.title,
      description: m.description,
      content: text,
      prompts,
      materials,
      activities,
      questions,
      video: m.video_url
    });
  }

  fullContent += `--------------------------------------------------------------------------------\n`;
  fullContent += `TOTAL DE CARACTERES: ${totalChars}\n\n`;

  // Detalhamento Integral
  for (const m of moduleDetails) {
    fullContent += `\n================================================================================\n`;
    fullContent += `MÓDULO ${m.index}: ${m.title}\n`;
    fullContent += `================================================================================\n`;
    fullContent += `DESCRIÇÃO: ${m.description || 'N/A'}\n`;
    fullContent += `VIDEO URL: ${m.video || 'N/A'}\n\n`;
    fullContent += `CONTEÚDO:\n${m.content}\n\n`;
    fullContent += `PROMPTS:\n${m.prompts}\n\n`;
    fullContent += `MATERIAIS:\n${m.materials}\n\n`;
    fullContent += `ATIVIDADES:\n${m.activities}\n\n`;
    fullContent += `QUESTÕES/QUIZ:\n${m.questions}\n`;
  }

  // Salvar Markdown
  fs.writeFileSync('auditoria_completa_influenciador_ia_tiktok_shop.md', fullContent);
  console.log(`Markdown gerado: auditoria_completa_influenciador_ia_tiktok_shop.md (${totalChars} caracteres)`);

  // Tentar gerar PDF simplificado (jspdf no worker pode ser limitado, mas vamos tentar via script node local)
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Auditoria: ${course.title}`, 10, 20);
  doc.setFontSize(12);
  doc.text(`CÓPIA DE AUDITORIA — NÃO É FONTE DE RESTAURAÇÃO`, 10, 30);
  doc.text(`Caracteres totais: ${totalChars}`, 10, 40);
  doc.text(`Data: ${new Date().toISOString()}`, 10, 50);
  
  // O PDF completo de 800k+ caracteres via jsPDF em um único arquivo pode estourar memória ou limites de página.
  // Faremos o PDF apenas como um "Sumário Executivo + Módulo 0" para validação, o MD conterá a totalidade.
  doc.addPage();
  doc.text("Resumo gerado com sucesso. Consulte o arquivo .md para o conteúdo integral.", 10, 20);
  
  const pdfBuffer = doc.output('arraybuffer');
  fs.writeFileSync('auditoria_completa_influenciador_ia_tiktok_shop.pdf', Buffer.from(pdfBuffer));
}

exportCourseAudit();
