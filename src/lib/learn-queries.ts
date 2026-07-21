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
  intro_video_path: string | null;
  intro_video_duration_seconds: number | null;
  intro_video_poster_path: string | null;
  pdf_path: string | null;
  pdf_file_name: string | null;
  complementary_content: string | null;
};




export type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  duration_minutes: number;
  track_id: string | null;
  track_title: string | null;
  track_slug: string | null;
  price: number;
  is_free: boolean;
  workload_hours: number;
  allow_pdf_download: boolean;
  full_pdf_path: string | null;
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
        .select(
          "id, slug, title, description, level, duration_minutes, workload_hours, track_id, price, is_free, allow_pdf_download, tracks:track_id ( title, slug )"
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;
      const track = (course as unknown as { tracks: { title: string; slug: string } | null }).tracks;
      const c = course as unknown as { price: number | null; is_free: boolean | null; workload_hours: number | null; allow_pdf_download: boolean | null };
      const detail: CourseDetail = {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        duration_minutes: course.duration_minutes,
        track_id: course.track_id,
        track_title: track?.title ?? null,
        track_slug: track?.slug ?? null,
        price: Number(c.price ?? 0),
        is_free: Boolean(c.is_free),
        workload_hours: Number(c.workload_hours ?? 0),
        allow_pdf_download: Boolean(c.allow_pdf_download),
      };


      const { data: modules, error: mErr } = await supabase
        .from("modules")
        .select(
          "id, course_id, slug, title, description, content_type, content_url, content_text, video_url, duration_minutes, sort_order, intro_video_path, intro_video_duration_seconds, intro_video_poster_path, pdf_path, pdf_file_name"
        )

        .eq("course_id", course.id)
        .eq("is_published", true)
        .order("sort_order");
      if (mErr) throw mErr;
      return {
        course: detail,
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
