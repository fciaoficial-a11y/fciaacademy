import { supabase } from "./src/integrations/supabase/client";
import * as fs from 'fs';

async function force() {
  const courseId = "e23cf598-23be-4dbe-b8f0-4c3a420d9b62";
  
  // Como o client anon não tem permissão de escrita/update via RLS (provavelmente),
  // e nós não temos a service_role key aqui, vamos tentar usar o que o projeto tem.
  // Vou criar um módulo via RPC ou ver se há um helper de admin.
  // Na verdade, vou tentar inserir novamente os módulos 1 e 2 com IDs específicos se possível,
  // mas o INSERT falhou silenciosamente antes.
  
  console.log("Iniciando tentativa de restauração forçada...");
  
  const modulesToCreate = [
    { sort_order: 1, title: "MÓDULO 1 — TikTok Shop: O Oceano Azul da Monetização", slug: "modulo-1-mentalidade-nichos", file: "docs/production/revisao-modulo-1.md" },
    { sort_order: 2, title: "MÓDULO 2 — Branding e Posicionamento do Influenciador", slug: "modulo-2-estrategia-posicionamento", file: "docs/production/revisao-modulo-2.md" }
  ];

  for (const m of modulesToCreate) {
    const content = fs.readFileSync(m.file, 'utf-8');
    const { data, error } = await supabase
      .from("modules")
      .insert({
        course_id: courseId,
        sort_order: m.sort_order,
        title: m.title,
        slug: m.slug,
        content_text: content,
        content_type: 'text',
        duration_minutes: 30
      })
      .select();
    
    if (error) console.error(`Erro ao criar Módulo ${m.sort_order}:`, error);
    else console.log(`Módulo ${m.sort_order} criado:`, data);
  }

  // Para o Módulo 4 que já existe, mas o update falha:
  const content4 = fs.readFileSync("docs/production/revisao-modulo-4.md", 'utf-8');
  const { error: err4 } = await supabase
    .from("modules")
    .update({ content_text: content4, content_type: 'text', video_url: null })
    .eq("course_id", courseId)
    .eq("sort_order", 4);
  
  if (err4) console.error("Erro ao atualizar Módulo 4:", err4);
  else console.log("Módulo 4 atualizado (supostamente).");
}

force();
