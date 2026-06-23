import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ModuleRow = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string;
  content_type: "video" | "pdf" | "text";
  content_url: string | null;
  content_text: string | null;
  video_url: string | null;
  duration_minutes: number;
  sort_order: number;
};


export type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  duration_minutes: number;
};

export type ProgressRow = {
  module_id: string;
  completed: boolean;
  progress_seconds: number;
};

export function courseLearnQuery(slug: string) {
  return queryOptions({
    queryKey: ["learn-course", slug],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("id, slug, title, description, level, duration_minutes")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;
      const { data: modules, error: mErr } = await supabase
        .from("modules")
        .select(
          "id, course_id, slug, title, description, content_type, content_url, content_text, video_url, duration_minutes, sort_order"
        )

        .eq("course_id", course.id)
        .eq("is_published", true)
        .order("sort_order");
      if (mErr) throw mErr;
      return {
        course: course as CourseDetail,
        modules: (modules ?? []) as ModuleRow[],
      };
    },
    staleTime: 30_000,
  });
}

export function progressQuery(courseId: string | undefined, userId: string | undefined) {
  return queryOptions({
    queryKey: ["progress", courseId, userId],
    enabled: Boolean(courseId && userId),
    queryFn: async (): Promise<ProgressRow[]> => {
      if (!courseId || !userId) return [];
      const { data, error } = await supabase
        .from("module_progress")
        .select("module_id, completed, progress_seconds")
        .eq("course_id", courseId)
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []) as ProgressRow[];
    },
    staleTime: 10_000,
  });
}
