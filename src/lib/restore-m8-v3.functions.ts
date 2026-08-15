
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const restoreM8PremiumV3 = createServerFn({ method: "POST" })
  .handler(async () => {
    const { contentM8Premium, questionsM8 } = await import("./rebuild-m8.functions");
    
    // Use an admin client for scripts if needed, but here we're using the client-side supabase which needs RLS to allow these writes.
    // However, since it's a server function, we might need a direct query to bypass if RLS blocks 'anon' (which server-side might be if not auth)
    // But this is an 'authenticated' environment usually.
    
    // Let's use the course ID directly to avoid lookup issues if RLS affects it
    const courseId = "e23cf598-23be-4dbe-b8f0-4c3a420d9b62";

    // 2. Update Module 8 Content
    const { error: modError } = await supabase
      .from("modules")
      .update({ 
        content_text: contentM8Premium,
        video_url: null 
      })
      .eq("course_id", courseId)
      .eq("slug", "influenciador-ia-m8");

    if (modError) throw modError;

    // 3. Update Quizzes for Module 8 (using the 'questions' table)
    const { data: module } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId)
      .eq("slug", "influenciador-ia-m8")
      .single();

    if (module) {
      await supabase.from("questions").delete().eq("module_id", module.id);
      
      const newQuestions = questionsM8.map((q, idx) => ({
        module_id: module.id,
        course_id: courseId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty,
        sort_order: idx,
        type: "multiple_choice",
        source_type: "manual",
        status: "approved",
        times_used: 0
      }));

      const { error: quizError } = await supabase.from("questions").insert(newQuestions);
      if (quizError) throw quizError;
    }

    return { success: true, message: "Módulo 8 restaurado para versão Premium (17k+ chars)" };
  });
