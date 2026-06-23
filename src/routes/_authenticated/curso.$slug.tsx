import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { courseLearnQuery, progressQuery, type ModuleRow } from "@/lib/learn-queries";

const searchSchema = z.object({ m: z.string().optional() });

export const Route = createFileRoute("/_authenticated/curso/$slug")({
  validateSearch: searchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(courseLearnQuery(params.slug)).then((d) => {
      if (!d) throw notFound();
    }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold">Curso não encontrado</h1>
      <Link to="/cursos" className="mt-6 inline-block text-sm text-primary hover:underline">
        Voltar ao catálogo
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-2xl">Erro ao carregar curso.</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: CourseLearnPage,
});

function CourseLearnPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(courseLearnQuery(slug));
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  if (!data) return null;
  const { course, modules } = data;

  const progress = useQuery(progressQuery(course.id, userId));
  const progressMap = useMemo(() => {
    const map = new Map<string, boolean>();
    (progress.data ?? []).forEach((p) => map.set(p.module_id, p.completed));
    return map;
  }, [progress.data]);

  const activeSlug = search.m ?? modules[0]?.slug;
  const activeModule = modules.find((m) => m.slug === activeSlug) ?? modules[0];
  const activeIndex = modules.findIndex((m) => m.id === activeModule?.id);
  const completedCount = modules.filter((m) => progressMap.get(m.id)).length;
  const percent = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;

  const setActive = (mSlug: string) =>
    navigate({ to: "/curso/$slug", params: { slug }, search: { m: mSlug } });

  const toggleComplete = useMutation({
    mutationFn: async (mod: ModuleRow) => {
      if (!userId) throw new Error("Não autenticado");
      const currentlyDone = progressMap.get(mod.id) ?? false;
      const { error } = await supabase.from("module_progress").upsert(
        {
          user_id: userId,
          module_id: mod.id,
          course_id: course.id,
          completed: !currentlyDone,
          completed_at: !currentlyDone ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,module_id" }
      );
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["progress", course.id, userId] }),
  });

  if (!activeModule) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl">Nenhum módulo disponível ainda.</h1>
      </div>
    );
  }

  const prev = activeIndex > 0 ? modules[activeIndex - 1] : null;
  const next = activeIndex < modules.length - 1 ? modules[activeIndex + 1] : null;
  const isComplete = progressMap.get(activeModule.id) ?? false;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_1fr] lg:px-6">
      <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Link
            to="/cursos"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Catálogo
          </Link>
          <h2 className="mt-3 font-display text-lg font-semibold leading-tight">{course.title}</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span className="font-medium text-foreground">{percent}%</span>
            </div>
            <Progress value={percent} />
            <p className="text-xs text-muted-foreground">
              {completedCount} de {modules.length} módulos
            </p>
          </div>

          <nav className="mt-6 space-y-1">
            {modules.map((m, i) => {
              const done = progressMap.get(m.id) ?? false;
              const active = m.id === activeModule.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActive(m.slug)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "bg-primary/10 ring-1 ring-inset ring-primary/40"
                      : "hover:bg-white/5"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                      <span>Módulo {i + 1}</span>
                      <ModuleTypeIcon type={m.content_type} />
                    </div>
                    <p
                      className={`mt-0.5 truncate text-sm font-medium ${
                        active ? "text-foreground" : "text-foreground/80"
                      }`}
                    >
                      {m.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {m.duration_minutes} min
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <ModuleTypeIcon type={activeModule.content_type} />
            <span>
              Módulo {activeIndex + 1} de {modules.length}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            {activeModule.title}
          </h1>
          {activeModule.description && (
            <p className="mt-2 text-muted-foreground">{activeModule.description}</p>
          )}
        </header>

        <ModuleContent module={activeModule} />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <Button
            onClick={() => toggleComplete.mutate(activeModule)}
            disabled={!userId || toggleComplete.isPending}
            variant={isComplete ? "secondary" : "default"}
            className="rounded-full"
          >
            {isComplete ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Concluído
              </>
            ) : (
              "Marcar como concluído"
            )}
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="rounded-full">
              <Link to="/quiz/$moduleId" params={{ moduleId: activeModule.id }}>
                Fazer quiz
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={!prev}
              onClick={() => prev && setActive(prev.slug)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={!next}
              onClick={() => next && setActive(next.slug)}
            >
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ModuleTypeIcon({ type }: { type: ModuleRow["content_type"] }) {
  if (type === "video") return <PlayCircle className="h-3.5 w-3.5" />;
  if (type === "pdf") return <FileText className="h-3.5 w-3.5" />;
  return <BookOpen className="h-3.5 w-3.5" />;
}

function ModuleContent({ module: mod }: { module: ModuleRow }) {
  if (mod.content_type === "video" && mod.content_url) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
        <iframe
          key={mod.id}
          src={mod.content_url}
          title={mod.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  if (mod.content_type === "pdf" && mod.content_url) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <object data={mod.content_url} type="application/pdf" className="h-[75vh] w-full">
          <div className="p-6 text-sm text-muted-foreground">
            Não foi possível exibir o PDF.{" "}
            <a
              href={mod.content_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Abrir em nova aba
            </a>
          </div>
        </object>
      </div>
    );
  }
  if (mod.content_type === "text") {
    return (
      <article className="prose prose-invert max-w-none rounded-2xl border border-border bg-card p-8">
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground">
          {mod.content_text ?? "Sem conteúdo."}
        </pre>
      </article>
    );
  }
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
      Conteúdo indisponível.
    </div>
  );
}
