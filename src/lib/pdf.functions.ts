import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "course-assets";
const TTL_SECONDS = 60 * 5; // 5 minutes

/**
 * Returns a short-lived signed URL for a module's PDF, only if the caller
 * has access to the course. All access control is enforced server-side.
 */
export const getModulePdfUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { moduleId: string }) => {
    if (!data?.moduleId || typeof data.moduleId !== "string") {
      throw new Error("moduleId obrigatório");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // RPC verifies auth + course access and returns the storage path (or null).
    const { data: pathData, error: pathErr } = await supabase.rpc(
      "get_module_pdf_path",
      { _module_id: data.moduleId }
    );
    if (pathErr) throw new Error(pathErr.message);

    let path = pathData as string | null;

    // Fallback: legacy modules that stored a signed URL in content_url.
    if (!path) {
      const { data: mod, error: modErr } = await supabase
        .from("modules")
        .select("content_url, content_type")
        .eq("id", data.moduleId)
        .maybeSingle();
      if (modErr) throw new Error(modErr.message);
      if (mod?.content_type === "pdf" && mod.content_url) {
        // Try to extract the object path from a legacy signed URL.
        const match = mod.content_url.match(
          /\/object\/(?:sign|public|authenticated)\/course-assets\/([^?]+)/
        );
        if (match) path = decodeURIComponent(match[1]);
      }
    }

    if (!path) throw new Error("PDF não configurado");

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, TTL_SECONDS);
    if (signErr) throw new Error(signErr.message);
    if (!signed?.signedUrl) throw new Error("Falha ao assinar URL");

    return { url: signed.signedUrl, expiresIn: TTL_SECONDS };
  });

export const getFullCoursePdfUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseId: string }) => {
    if (!data?.courseId || typeof data.courseId !== "string") {
      throw new Error("courseId obrigatório");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verificar acesso ao curso
    const { data: enrollment, error: enrollErr } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", data.courseId)
      .eq("user_id", userId)
      .maybeSingle();

    if (enrollErr) throw new Error(enrollErr.message);

    // Se não tiver enrollment, verificar se é admin
    if (!enrollment) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Acesso negado");
    }

    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .select("full_pdf_path, allow_pdf_download")
      .eq("id", data.courseId)
      .single();

    if (courseErr) throw new Error(courseErr.message);
    if (!course.full_pdf_path) throw new Error("PDF completo não disponível para este curso");
    if (!course.allow_pdf_download) throw new Error("Download de PDF desativado para este curso");

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(course.full_pdf_path, TTL_SECONDS);

    if (signErr) throw new Error(signErr.message);
    return { url: signed.signedUrl, expiresIn: TTL_SECONDS };
  });
