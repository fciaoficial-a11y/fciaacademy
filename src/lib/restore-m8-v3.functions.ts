
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const restoreM8PremiumV3 = createServerFn({ method: "POST" })
  .handler(async () => {
    const { contentM8Premium, questionsM8 } = await import("./rebuild-m8.functions");
    
    // 1. Get Course ID
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", "influenciador-ia-tiktok-shop")
      .single();

    if (!course) throw new Error("Course not found");

    // 2. Update Module 8 Content
    const { error: modError } = await supabase
      .from("modules")
      .update({ 
        content_text: contentM8Premium,
        video_url: null 
      })
      .eq("course_id", course.id)
      .eq("slug", "influenciador-ia-m8");

    if (modError) throw modError;

    // 3. Update Quizzes for Module 8
    const { data: module } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course.id)
      .eq("slug", "influenciador-ia-m8")
      .single();

    if (module) {
      await supabase.from("quizzes").delete().eq("module_id", module.id);
      
      const quizzes = questionsM8.map(q => ({
        module_id: module.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty
      }));

      await supabase.from("quizzes").insert(quizzes);
    }

    return { success: true, message: "Módulo 8 restaurado para versão Premium (17k+ chars)" };
  });
