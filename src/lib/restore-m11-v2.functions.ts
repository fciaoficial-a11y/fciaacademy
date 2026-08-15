
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const restoreM11PremiumV2 = createServerFn({ method: "POST" })
  .handler(async () => {
    const { contentM11Premium, questionsM11 } = await import("./rebuild-m11.functions");
    
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", "influenciador-ia-tiktok-shop")
      .single();

    if (!course) throw new Error("Course not found");

    const { error: modError } = await supabase
      .from("modules")
      .update({ 
        content_text: contentM11Premium,
        video_url: null 
      })
      .eq("course_id", course.id)
      .eq("slug", "influenciador-ia-m11");

    if (modError) throw modError;

    const { data: module } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course.id)
      .eq("slug", "influenciador-ia-m11")
      .single();

    if (module) {
      await supabase.from("quizzes").delete().eq("module_id", module.id);
      const quizzes = questionsM11.map(q => ({
        module_id: module.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty
      }));
      await supabase.from("quizzes").insert(quizzes);
    }

    return { success: true, message: "Módulo 11 restaurado para versão Premium (16k+ chars)" };
  });
