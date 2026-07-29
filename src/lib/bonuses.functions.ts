import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Bonus metadata visible to the client. `pdf_path` is intentionally omitted —
 * the actual asset URL is only released via getBonusDownloadUrl after the
 * server verifies course access and logs the download.
 */
export interface CourseBonusPublic {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  value_label: string | null;
  description: string;
  cover_url: string | null;
  sort_order: number;
  has_pdf: boolean;
}

/**
 * Lists published bonuses for a given course. Requires an authenticated user
 * with access to the course (paid enrollment, free course, or admin).
 */
export const listCourseBonuses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseId: string }) => {
    if (!data?.courseId || typeof data.courseId !== "string") {
      throw new Error("courseId obrigatório");
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<CourseBonusPublic[]> => {
    const { supabase, userId } = context;

    // Access gate: has_course_access covers both enrollment and admin via RLS/DEFINER.
    const { data: accessData, error: accessErr } = await supabase.rpc(
      "has_course_access",
      { _user: userId, _course: data.courseId }
    );
    if (accessErr) throw new Error(accessErr.message);

    // Admin fallback (paid course with no enrollment yet, but admin role).
    let hasAccess = Boolean(accessData);
    if (!hasAccess) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      hasAccess = Boolean(isAdmin);
    }
    if (!hasAccess) {
      throw new Error("forbidden");
    }

    const { data: rows, error } = await supabase
      .from("course_bonuses")
      .select("id, slug, title, subtitle, value_label, description, cover_url, sort_order, pdf_path")
      .eq("course_id", data.courseId)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);

    return (rows ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      value_label: r.value_label,
      description: r.description,
      cover_url: r.cover_url,
      sort_order: r.sort_order,
      has_pdf: Boolean(r.pdf_path),
    }));
  });

/**
 * Returns the resolved download URL for one bonus. All authorization and
 * download logging happens inside the SECURITY DEFINER RPC
 * `get_bonus_download_path` — the client only receives a URL when allowed.
 */
export const getBonusDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { bonusId: string }) => {
    if (!data?.bonusId || typeof data.bonusId !== "string") {
      throw new Error("bonusId obrigatório");
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const { supabase } = context;

    const { data: path, error } = await supabase.rpc("get_bonus_download_path", {
      _bonus_id: data.bonusId,
    });
    if (error) throw new Error(error.message);
    if (!path || typeof path !== "string") {
      throw new Error("bônus indisponível");
    }
    return { url: path };
  });
