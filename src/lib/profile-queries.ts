import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InProgressCourse {
  course_id: string;
  slug: string;
  title: string;
  completed_modules: number;
  total_modules: number;
  last_activity: string;
}

/**
 * Cursos com pelo menos um módulo iniciado, sem certificado emitido.
 * Faz duas leituras (progress + modules + certificates) e agrega no cliente
 * para respeitar RLS sem precisar de RPC.
 */
export function inProgressCoursesQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["profile", "in-progress", userId],
    enabled: !!userId,
    queryFn: async (): Promise<InProgressCourse[]> => {
      if (!userId) return [];

      const [{ data: progress, error: pErr }, { data: certs, error: cErr }] =
        await Promise.all([
          supabase
            .from("module_progress")
            .select("course_id, completed, updated_at, courses(slug, title)")
            .eq("user_id", userId),
          supabase.from("certificates").select("course_id").eq("user_id", userId),
        ]);
      if (pErr) throw pErr;
      if (cErr) throw cErr;

      const certified = new Set((certs ?? []).map((c) => c.course_id));

      // Agrupa por curso
      const byCourse = new Map<
        string,
        { slug: string; title: string; done: number; last: string }
      >();
      for (const row of progress ?? []) {
        const r = row as unknown as {
          course_id: string;
          completed: boolean;
          updated_at: string;
          courses: { slug: string; title: string } | { slug: string; title: string }[] | null;
        };
        if (!r.course_id || certified.has(r.course_id)) continue;
        const course = Array.isArray(r.courses) ? r.courses[0] : r.courses;
        if (!course) continue;
        const cur = byCourse.get(r.course_id) ?? {
          slug: course.slug,
          title: course.title,
          done: 0,
          last: r.updated_at,
        };
        if (r.completed) cur.done += 1;
        if (r.updated_at > cur.last) cur.last = r.updated_at;
        byCourse.set(r.course_id, cur);
      }

      if (byCourse.size === 0) return [];

      // Total de módulos publicados por curso
      const ids = [...byCourse.keys()];
      const { data: mods, error: mErr } = await supabase
        .from("modules")
        .select("course_id")
        .in("course_id", ids)
        .eq("is_published", true);
      if (mErr) throw mErr;
      const totals = new Map<string, number>();
      for (const m of mods ?? []) {
        totals.set(m.course_id, (totals.get(m.course_id) ?? 0) + 1);
      }

      return [...byCourse.entries()]
        .map(([course_id, v]) => ({
          course_id,
          slug: v.slug,
          title: v.title,
          completed_modules: v.done,
          total_modules: totals.get(course_id) ?? 0,
          last_activity: v.last,
        }))
        .sort((a, b) => (a.last_activity < b.last_activity ? 1 : -1));
    },
    staleTime: 15_000,
  });
}
