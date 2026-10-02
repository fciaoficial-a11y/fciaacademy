import { createServerFn } from "@/lib/server-fn";
import { z } from "zod";

export const auditCourses = createServerFn()
  .options({ method: "GET" })
  .handler(async ({ supabaseAdmin }) => {
    const { data: courses, error } = await supabaseAdmin
      .from("courses")
      .select("id, slug, title, price, is_published, created_at, updated_at")
      .in("slug", ["google-ai-pro", "metodo-ia-criativa"])
      .order("created_at", { ascending: true });

    if (error) {
      return {
        ok: false as const,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return {
      ok: true as const,
      data: { courses },
    };
  });

export type AuditCoursesResponse = Awaited<ReturnType<typeof auditCourses>>;
