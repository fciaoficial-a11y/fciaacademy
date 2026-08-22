
import { supabaseAdmin } from './src/integrations/supabase/client.server';
import fs from 'fs';

async function fetchCourseData() {
  const courseSlug = 'influenciador-ia-tiktok-shop';
  console.log(`Buscando dados para o curso: ${courseSlug}`);

  // Fetch only necessary columns to avoid schema issues with relations
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('id, title, slug, is_published, price, description')
    .eq('slug', courseSlug)
    .single();

  if (courseError || !course) {
    console.error('Erro ao buscar curso:', courseError);
    process.exit(1);
  }

  // Use 'sort_order' instead of 'order_index' based on information_schema check
  const { data: modules, error: modulesError } = await supabaseAdmin
    .from('modules')
    .select('id, title, description, content_text, video_url, sort_order')
    .eq('course_id', course.id)
    .order('sort_order', { ascending: true });

  if (modulesError || !modules) {
    console.error('Erro ao buscar módulos:', modulesError);
    process.exit(1);
  }

  // Fetch questions for each module to populate materials/prompts/activities logic if stored as JSON or in the questions table
  const moduleIds = modules.map(m => m.id);
  const { data: questions, error: questionsError } = await supabaseAdmin
    .from('questions')
    .select('*')
    .in('module_id', moduleIds);

  const result = {
    course,
    modules: modules.map(m => ({
      ...m,
      prompts: [], // Default empty as they might be inside content_text or a different field
      materials: [],
      activities: [],
      questions: questions ? questions.filter(q => q.module_id === m.id) : []
    }))
  };

  fs.writeFileSync('/tmp/course_data.json', JSON.stringify(result, null, 2));
  console.log('Dados do curso salvos em /tmp/course_data.json');
}

fetchCourseData();
