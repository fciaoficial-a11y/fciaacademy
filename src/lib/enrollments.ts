import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Enrollment {
  id: string;
  course_id: string;
  track_id: string | null;
  plan_at_enrollment: string;
  started_at: string;
  last_accessed_at: string;
}

export function enrollmentQuery(courseId: string | undefined, userId: string | undefined) {
  return queryOptions({
    queryKey: ["enrollment", courseId, userId],
    enabled: Boolean(courseId && userId),
    queryFn: async (): Promise<Enrollment | null> => {
      if (!courseId || !userId) return null;
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, course_id, track_id, plan_at_enrollment, started_at, last_accessed_at")
        .eq("course_id", courseId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as Enrollment | null) ?? null;
    },
  });
}

export function userEnrollmentsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["enrollments", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Enrollment[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, course_id, track_id, plan_at_enrollment, started_at, last_accessed_at")
        .eq("user_id", userId)
        .order("last_accessed_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Enrollment[];
    },
  });
}

export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  const { data, error } = await supabase.rpc("enroll_in_course", { _course_id: courseId });
  if (error) throw error;
  return data as unknown as Enrollment;
}
