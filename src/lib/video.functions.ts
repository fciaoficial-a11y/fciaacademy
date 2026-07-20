import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "course-videos";
const TTL_SECONDS = 60 * 5; // 5 minutes

/**
 * Returns short-lived signed URLs for a module's intro video (and optional poster).
 * Enforces access control server-side via RPC.
 */
export const getModuleIntroVideoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { moduleId: string }) => {
    if (!data?.moduleId || typeof data.moduleId !== "string") {
      throw new Error("moduleId obrigatório");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: rows, error: rpcErr } = await supabase.rpc(
      "get_module_intro_video_path",
      { _module_id: data.moduleId }
    );
    if (rpcErr) throw new Error(rpcErr.message);

    const row = Array.isArray(rows) ? rows[0] : rows;
    const videoPath = (row?.video_path ?? null) as string | null;
    const posterPath = (row?.poster_path ?? null) as string | null;

    if (!videoPath) return { url: null, poster: null, expiresIn: TTL_SECONDS };

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(videoPath, TTL_SECONDS);
    if (signErr) throw new Error(signErr.message);

    let posterUrl: string | null = null;
    if (posterPath) {
      const { data: p } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(posterPath, TTL_SECONDS);
      posterUrl = p?.signedUrl ?? null;
    }

    return {
      url: signed?.signedUrl ?? null,
      poster: posterUrl,
      expiresIn: TTL_SECONDS,
    };
  });
