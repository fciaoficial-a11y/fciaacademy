import { queryOptions } from "@tanstack/react-query";
import { listCourseBonuses, type CourseBonusPublic } from "@/lib/bonuses.functions";

export function courseBonusesQuery(courseId: string | undefined, enabled: boolean) {
  return queryOptions({
    queryKey: ["course-bonuses", courseId],
    enabled: Boolean(courseId) && enabled,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<CourseBonusPublic[]> => {
      if (!courseId) return [];
      return await listCourseBonuses({ data: { courseId } });
    },
  });
}

export type { CourseBonusPublic } from "@/lib/bonuses.functions";
