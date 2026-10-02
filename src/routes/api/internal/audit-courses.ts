import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/internal/audit-courses')({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server")

        const { data: courses, error } = await supabaseAdmin
          .from("courses")
          .select("id, slug, title, price, is_published, created_at, updated_at")
          .in("slug", ["google-ai-pro", "metodo-ia-criativa"])
          .order("created_at", { ascending: true })

        if (error) {
          return Response.json(
            { ok: false, error: { message: error.message, code: error.code } },
            { status: 500 }
          )
        }

        return Response.json({ ok: true, data: { courses } }, { status: 200 })
      },
    },
  },
})

export type AuditCoursesResponse = {
  ok: true
  data: {
    courses: {
      id: string
      slug: string
      title: string
      price: number
      is_published: boolean
      created_at: string
      updated_at: string
    }[]
  }
} | {
  ok: false
  error: { message: string; code: string }
}
