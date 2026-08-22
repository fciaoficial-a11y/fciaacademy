
import { supabaseAdmin } from './src/integrations/supabase/client.server';
import fs from 'fs';

async function fetchCourseData() {
  const courseSlug = 'influenciador-ia-tiktok-shop';
  console.log(`Buscando dados para o curso: ${courseSlug}`);

  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('id, title, slug, is_published, price, description')
    .eq('slug', courseSlug)
    .single();

  if (courseError || !course) {
    console.error('Erro ao buscar curso:', courseError);
    process.exit(1);
  }

  const { data: modules, error: modulesError } = await supabaseAdmin
    .from('modules')
    .select('id, title, description, content_text, video_url, sort_order')
    .eq('course_id', course.id)
    .order('sort_order', { ascending: true });

  if (modulesError || !modules) {
    console.error('Erro ao buscar módulos:', modulesError);
    process.exit(1);
  }

  const moduleIds = modules.map(m => m.id);
  const { data: questions, error: questionsError } = await supabaseAdmin
    .from('questions')
    .select('*')
    .in('module_id', moduleIds);

  const result = {
    course,
    modules: modules.map(m => ({
      ...m,
      prompts: [],
      materials: [],
      activities: [],
      questions: questions ? questions.filter(q => q.module_id === m.id) : []
    }))
  };

  fs.writeFileSync('/tmp/course_data.json', JSON.stringify(result, null, 2));
  console.log('Dados do curso salvos em /tmp/course_data.json');
}

fetchCourseData();
