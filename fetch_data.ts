
import { supabaseAdmin } from './src/integrations/supabase/client.server';
import fs from 'fs';

async function fetchCourseData() {
  const courseSlug = 'influenciador-ia-tiktok-shop';
  console.log(`Buscando dados para o curso: ${courseSlug}`);

  // Fetch course without tracks join first to avoid schema mismatch
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('slug', courseSlug)
    .single();

  if (courseError || !course) {
    console.error('Erro ao buscar curso:', courseError);
    process.exit(1);
  }

  const { data: modules, error: modulesError } = await supabaseAdmin
    .from('modules')
    .select('*')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  if (modulesError || !modules) {
    console.error('Erro ao buscar módulos:', modulesError);
    process.exit(1);
  }

  const result = {
    course,
    modules: modules.map(m => ({
      ...m,
      prompts: m.prompts || [],
      materials: m.materials || [],
      activities: m.activities || [],
      questions: m.questions || []
    }))
  };

  fs.writeFileSync('/tmp/course_data.json', JSON.stringify(result, null, 2));
  console.log('Dados do curso salvos em /tmp/course_data.json');
}

fetchCourseData();
