import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const LANDING_ID = "18ddfd2c-4a9b-4e6f-b9f0-6c3e8a1d2b4f";
const EXPECTED_SLUG = "google-ai-pro";

export const Route = createFileRoute("/api/internal/diagnose-google-ai-pro")({
  server: {
    handlers: {
      GET: async () => {
        if (process.env.NODE_ENV === "production") {
          return new Response(JSON.stringify({ error: "Not available in production" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        const [byLandingId, bySlug] = await Promise.all([
          supabaseAdmin
            .from("courses")
            .select("id, slug, title, price, is_published")
            .eq("id", LANDING_ID)
            .maybeSingle(),
          supabaseAdmin
            .from("courses")
            .select("id, slug, title, price, is_published")
            .eq("slug", EXPECTED_SLUG)
            .maybeSingle(),
        ]);

        const sameRecord =
          byLandingId.data !== null &&
          bySlug.data !== null &&
          byLandingId.data.id === bySlug.data.id;

        const checkoutEligible =
          byLandingId.data !== null &&
          byLandingId.data.is_published === true &&
          Number(byLandingId.data.price) > 0;

        return Response.json({
          by_landing_id: {
            data: byLandingId.data,
            error: byLandingId.error
              ? { code: byLandingId.error.code ?? "", message: byLandingId.error.message }
              : null,
          },
          by_slug: {
            data: bySlug.data,
            error: bySlug.error
              ? { code: bySlug.error.code ?? "", message: bySlug.error.message }
              : null,
          },
          comparison: {
            landing_id: LANDING_ID,
            same_record: sameRecord,
            checkout_eligible: checkoutEligible,
          },
        });
      },
    },
  },
});
