import { supabase } from "./src/integrations/supabase/client";

async function check() {
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "influenciador-ia-tiktok-shop")
    .maybeSingle();

  if (!course) {
    console.log("Curso não encontrado");
    return;
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, sort_order, content_text, content_type")
    .eq("course_id", course.id)
    .order("sort_order");

  console.log(JSON.stringify(modules, null, 2));
}

check();
