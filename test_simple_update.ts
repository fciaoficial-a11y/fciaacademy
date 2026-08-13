import { supabase } from "./src/integrations/supabase/client";

async function test() {
  const courseId = "e23cf598-23be-4dbe-b8f0-4c3a420d9b62";
  
  // Primeiro, vamos ver o que REALMENTE temos no banco agora para esse curso
  const { data: modules } = await supabase
    .from("modules")
    .select("id, sort_order, title")
    .eq("course_id", courseId)
    .order("sort_order");
  
  console.log("Módulos atuais para o curso:", JSON.stringify(modules, null, 2));

  if (modules && modules.length > 0) {
    const target = modules.find(m => m.sort_order === 1 || m.sort_order === 3); // 3 nós sabemos que existe
    if (target) {
      console.log(`Tentando atualizar o módulo ID: ${target.id} (sort_order: ${target.sort_order})`);
      const { data, error } = await supabase
        .from("modules")
        .update({ content_type: 'text' })
        .eq("id", target.id)
        .select();
      
      if (error) console.error("Erro no update:", error);
      else console.log("Update bem sucedido:", data);
    }
  }
}

test();
