import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type QuestionRow = {
  id: string;
  module_id: string;
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correct_answer: string;
  explanation: string | null;
  sort_order: number;
};

export type QuizModuleContext = {
  module: {
    id: string;
    slug: string;
    title: string;
    course_id: string;
  };
  course: { id: string; slug: string; title: string };
  questions: QuestionRow[];
};

export function quizQuery(moduleId: string) {
  return queryOptions({
    queryKey: ["quiz", moduleId],
    queryFn: async (): Promise<QuizModuleContext | null> => {
      const { data: mod, error: mErr } = await supabase
        .from("modules")
        .select("id, slug, title, course_id, courses!inner(id, slug, title)")
        .eq("id", moduleId)
        .maybeSingle();
      if (mErr) throw mErr;
      if (!mod) return null;

      const { data: questions, error: qErr } = await supabase
        .from("questions")
        .select("id, module_id, question, type, options, correct_answer, explanation, sort_order")
        .eq("module_id", moduleId)
        .eq("status", "approved")
        .order("sort_order");
      if (qErr) throw qErr;

      const course = Array.isArray(mod.courses) ? mod.courses[0] : (mod.courses as any);

      return {
        module: { id: mod.id, slug: mod.slug, title: mod.title, course_id: mod.course_id },
        course: { id: course.id, slug: course.slug, title: course.title },
        questions: (questions ?? []).map((q: any) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
        })) as QuestionRow[],
      };
    },
    staleTime: 30_000,
  });
}

export function attemptsQuery(moduleId: string, userId: string | undefined) {
  return queryOptions({
    queryKey: ["quiz-attempts", moduleId, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("id, score, passed, correct_count, total_questions, created_at")
        .eq("module_id", moduleId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5_000,
  });
}

export type QuizEligibility = {
  enrolled: boolean;
  total_required_modules: number;
  completed_required_modules: number;
  completion_percent: number;
  quiz_unlocked: boolean;
  block_reason: string | null;
};

export function eligibilityQuery(courseId: string | undefined, userId: string | undefined) {
  return queryOptions({
    queryKey: ["quiz-eligibility", courseId, userId],
    enabled: Boolean(courseId && userId),
    queryFn: async (): Promise<QuizEligibility | null> => {
      if (!courseId) return null;
      const { data, error } = await supabase.rpc("get_quiz_eligibility", { _course_id: courseId });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row as QuizEligibility) ?? null;
    },
    staleTime: 5_000,
  });
}

export const PASS_THRESHOLD = 70;
