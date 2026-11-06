import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const previewQuery = queryOptions({
  queryKey: ["preview", "influencer-com-ia"],
  queryFn: async () => {
    const { data: course, error } = await supabase
      .from("courses")
      .select("id, slug, title, description, cover_url, price, is_free, workload_hours, is_published")
      .eq("slug", "influencer-com-ia")
      .maybeSingle();
    if (error) throw error;
    if (!course) return { course: null, modules: [] as Array<{ id: string; slug: string; title: string; description: string | null; sort_order: number }> };
    const { data: modules, error: mErr } = await supabase
      .from("modules")
      .select("id, slug, title, description, sort_order")
      .eq("course_id", course.id)
      .order("sort_order");
    if (mErr) throw mErr;
    return { course, modules: modules ?? [] };
  },
});

export const Route = createFileRoute("/preview/influencer-com-ia")({
  loader: ({ context }) => context.queryClient.ensureQueryData(previewQuery),
  head: () => ({
    meta: [
      { title: "Influenciador de IA — FCIA Academy" },
      { name: "description", content: "Preview do curso Influencer com IA — 5 módulos, certificado incluso." },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  useLoaderData({ from: "/preview/influencer-com-ia" });
  const { data } = useSuspenseQuery(previewQuery);
  const { course, modules } = data;

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] p-10 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold">Curso ainda não encontrado</h1>
          <p className="mt-2 text-sm text-white/70">
            O curso <code className="rounded bg-white/10 px-1">influencer-com-ia</code> não está no banco. Rode o seed em supabase/migrations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link to="/cursos" className="text-xs uppercase tracking-[0.3em] text-cyan-300/80 hover:text-cyan-200">
          ← Catálogo
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl shadow-[0_0_80px_-20px_rgba(34,211,238,0.4)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-200">
            Preview público
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-white/70">{course.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="text-3xl font-semibold">
              {course.is_free ? "Gratuito" : `R$ ${Number(course.price ?? 0).toFixed(2).replace(".", ",")}`}
            </div>
            <span className="text-sm text-white/50">· {course.workload_hours}h de conteúdo</span>
            <span className="text-sm text-white/50">· {modules.length} módulos</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black hover:opacity-90">
              <Link to="/course/influencer-com-ia">Entrar no curso</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link to="/curso/$slug/oferta" params={{ slug: "influencer-com-ia" }}>Página de vendas</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-3">
          {modules.map((m, i) => (
            <div key={m.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300/70">
                Módulo {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-1 text-lg font-medium">{m.title}</div>
              {m.description ? (
                <p className="mt-1 text-sm text-white/60">{m.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
