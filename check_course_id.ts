import { supabase } from "./src/integrations/supabase/client";

async function check() {
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title");
  console.log("Cursos:", JSON.stringify(courses, null, 2));

  const courseSlug = "influenciador-ia-tiktok-shop";
  const { data: modules } = await supabase
    .from("modules")
    .select("id, course_id, sort_order, title");
  console.log("Módulos:", JSON.stringify(modules, null, 2));
}

check();
