import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, AlertTriangle, Rocket, EyeOff, BookOpen, FileText, Film, ListChecks, GraduationCap, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  adminCoursesQuery,
  adminModulesQuery,
  adminQuestionsQuery,
  adminTracksQuery,
  updateRow,
  type AdminCourse,
  type AdminModule,
  type AdminQuestion,
} from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/producao")({
  head: () => ({ meta: [{ title: "Produção de Cursos — Admin" }] }),
  component: ProducaoPage,
});

/** Regra oficial: mínimo de questões aprovadas por curso para liberar o quiz de forma saudável. */
const MIN_QUESTIONS_PER_COURSE = 20;
/** Regra oficial: mínimo de módulos publicados por curso. */
const MIN_MODULES_PER_COURSE = 3;

type ModuleStatus = {
  module: AdminModule;
  hasTitle: boolean;
  hasDescription: boolean;
  hasMainContent: boolean;
  hasPdf: boolean;
  hasIntroVideo: boolean;
  isPublished: boolean;
};

type CourseReadiness = {
  course: AdminCourse;
  trackTitle: string | null;
  moduleStatuses: ModuleStatus[];
  totalModules: number;
  publishedModules: number;
  approvedQuestions: number;
  draftQuestions: number;
  checks: {
    metadata: boolean;
    modulesCount: boolean;
    mainContentAll: boolean;
    pdfAll: boolean;
    videoAll: boolean;
    questionsBank: boolean;
    certificate: boolean;
  };
  readyToPublish: boolean;
};

function moduleHasMainContent(m: AdminModule): boolean {
  if (m.content_type === "pdf") return Boolean(m.pdf_path);
  if (m.content_type === "video") return Boolean(m.content_url);
  if (m.content_type === "text") return Boolean(m.content_text && m.content_text.trim().length > 40);
  return false;
}

function computeReadiness(
  course: AdminCourse,
  trackTitle: string | null,
  modules: AdminModule[],
  questions: AdminQuestion[],
): CourseReadiness {
  const courseModules = modules.filter((m) => m.course_id === course.id);
  const courseQuestions = questions.filter((q) => q.course_id === course.id);
  const published = courseModules.filter((m) => m.is_published);

  const moduleStatuses: ModuleStatus[] = courseModules.map((m) => ({
    module: m,
    hasTitle: Boolean(m.title?.trim()),
    hasDescription: Boolean(m.description?.trim()),
    hasMainContent: moduleHasMainContent(m),
    hasPdf: Boolean(m.pdf_path),
    hasIntroVideo: Boolean(m.intro_video_path),
    isPublished: m.is_published,
  }));

  const approvedQuestions = courseQuestions.filter((q) => q.status === "approved").length;
  const draftQuestions = courseQuestions.filter((q) => q.status === "draft").length;

  const metadata = Boolean(
    course.title?.trim() &&
      course.slug?.trim() &&
      course.description?.trim() &&
      course.duration_minutes > 0,
  );
  const modulesCount = published.length >= MIN_MODULES_PER_COURSE;
  const mainContentAll = published.length > 0 && published.every(moduleHasMainContent);
  // PDF e vídeo são "suportados" pelo pipeline; para publicar exigimos presença em todos os módulos.
  const pdfAll = published.length > 0 && published.every((m) => Boolean(m.pdf_path));
  const videoAll = published.length > 0 && published.every((m) => Boolean(m.intro_video_path));
  const questionsBank = approvedQuestions >= MIN_QUESTIONS_PER_COURSE;
  const certificate = Boolean((course as any).certificate_enabled ?? true);

  const readyToPublish =
    metadata && modulesCount && mainContentAll && questionsBank && certificate;

  return {
    course,
    trackTitle,
    moduleStatuses,
    totalModules: courseModules.length,
    publishedModules: published.length,
    approvedQuestions,
    draftQuestions,
    checks: { metadata, modulesCount, mainContentAll, pdfAll, videoAll, questionsBank, certificate },
    readyToPublish,
  };
}

function ProducaoPage() {
  const qc = useQueryClient();
  const courses = useQuery(adminCoursesQuery);
  const modules = useQuery(adminModulesQuery);
  const questions = useQuery(adminQuestionsQuery);
  const tracks = useQuery(adminTracksQuery);

  const readiness = useMemo<CourseReadiness[]>(() => {
    if (!courses.data || !modules.data || !questions.data) return [];
    return courses.data
      .map((c) =>
        computeReadiness(
          c,
          tracks.data?.find((t) => t.id === c.track_id)?.title ?? null,
          modules.data ?? [],
          questions.data ?? [],
        ),
      )
      .sort((a, b) => Number(b.course.is_published) - Number(a.course.is_published));
  }, [courses.data, modules.data, questions.data, tracks.data]);

  const togglePublish = useMutation({
    mutationFn: (c: AdminCourse) => updateRow("courses", c.id, { is_published: !c.is_published }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Status do curso atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const loading = courses.isLoading || modules.isLoading || questions.isLoading;

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Produção de cursos</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Painel oficial de prontidão. Um curso só é considerado pronto para publicar quando cumpre o padrão pedagógico
            da FCIA: metadados, módulos publicados, conteúdo principal, banco mínimo de questões e certificado habilitado.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/gerar-curso">
            <Rocket className="mr-2 h-4 w-4" />
            Novo curso com IA
          </Link>
        </Button>
      </header>

      {/* Pipeline oficial */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Pipeline oficial</h2>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <PipelineStep n={1} label="Cadastro do curso" to="/admin/cursos" icon={BookOpen} />
          <PipelineStep n={2} label="Módulos + vídeo + PDF" to="/admin/modulos" icon={GraduationCap} />
          <PipelineStep n={3} label="Banco de questões (≥20)" to="/admin/questoes" icon={ListChecks} />
          <PipelineStep n={4} label="Publicar + certificado" to="/admin/certificados" icon={Award} />
        </ol>
      </section>

      {loading && (
        <p className="mt-6 text-sm text-muted-foreground">Carregando prontidão dos cursos…</p>
      )}

      <div className="mt-6 grid gap-4">
        {readiness.map((r) => (
          <CourseCard
            key={r.course.id}
            r={r}
            onTogglePublish={() => togglePublish.mutate(r.course)}
            pending={togglePublish.isPending}
          />
        ))}
        {!loading && readiness.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            Nenhum curso cadastrado ainda. Comece em <Link to="/admin/cursos" className="text-primary underline">Cursos</Link>.
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineStep({
  n,
  label,
  to,
  icon: Icon,
}: {
  n: number;
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-background/40 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
        {n}
      </span>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      )}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

function CourseCard({
  r,
  onTogglePublish,
  pending,
}: {
  r: CourseReadiness;
  onTogglePublish: () => void;
  pending: boolean;
}) {
  const c = r.course;
  const pctChecks =
    (Object.values(r.checks).filter(Boolean).length / Object.values(r.checks).length) * 100;

  return (
    <article className="rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{c.title || "(sem título)"}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                c.is_published
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {c.is_published ? "Publicado" : "Rascunho"}
            </span>
            {r.readyToPublish ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Pronto
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-amber-400">
                <AlertTriangle className="h-3 w-3" /> Em produção
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Trilha: {r.trackTitle ?? "—"} · Slug: <code className="font-mono">{c.slug}</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/modulos">Módulos</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/questoes">Questões</Link>
          </Button>
          <Button
            variant={c.is_published ? "outline" : "default"}
            size="sm"
            disabled={pending || (!c.is_published && !r.readyToPublish)}
            onClick={onTogglePublish}
            title={!c.is_published && !r.readyToPublish ? "Complete o checklist para publicar" : undefined}
          >
            {c.is_published ? (
              <>
                <EyeOff className="mr-1.5 h-4 w-4" /> Despublicar
              </>
            ) : (
              <>
                <Rocket className="mr-1.5 h-4 w-4" /> Publicar
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full ${r.readyToPublish ? "bg-emerald-500" : "bg-primary"}`}
          style={{ width: `${pctChecks}%` }}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ul className="grid gap-1.5">
          <Check ok={r.checks.metadata} label="Metadados básicos (título, slug, descrição, duração)" />
          <Check
            ok={r.checks.modulesCount}
            label={`Pelo menos ${MIN_MODULES_PER_COURSE} módulos publicados (${r.publishedModules}/${MIN_MODULES_PER_COURSE})`}
          />
          <Check ok={r.checks.mainContentAll} label="Conteúdo principal em todos os módulos publicados" />
          <Check ok={r.checks.pdfAll} label="PDF (complementar ou principal) em todos os módulos" />
          <Check ok={r.checks.videoAll} label="Vídeo curto de abertura em todos os módulos" />
          <Check
            ok={r.checks.questionsBank}
            label={`Banco de questões aprovadas ≥ ${MIN_QUESTIONS_PER_COURSE} (${r.approvedQuestions} aprovadas · ${r.draftQuestions} rascunho)`}
          />
          <Check ok={r.checks.certificate} label="Certificado habilitado" />
        </ul>

        <div className="rounded-xl border border-white/10 bg-background/40 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Módulos ({r.totalModules})
          </p>
          {r.moduleStatuses.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum módulo criado.</p>
          ) : (
            <ul className="grid gap-1.5">
              {r.moduleStatuses
                .sort((a, b) => a.module.sort_order - b.module.sort_order)
                .map((s) => (
                  <li
                    key={s.module.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1.5 text-xs"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {s.module.sort_order}·
                      </span>{" "}
                      {s.module.title}
                      {!s.isPublished && (
                        <span className="ml-1 rounded bg-muted px-1 text-[10px] text-muted-foreground">
                          rascunho
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <ModuleIcon ok={s.hasMainContent} icon={BookOpen} title="Conteúdo principal" />
                      <ModuleIcon ok={s.hasPdf} icon={FileText} title="PDF" />
                      <ModuleIcon ok={s.hasIntroVideo} icon={Film} title="Vídeo de abertura" />
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

function ModuleIcon({
  ok,
  icon: Icon,
  title,
}: {
  ok: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <span
      title={`${title}: ${ok ? "ok" : "faltando"}`}
      className={ok ? "text-primary" : "text-muted-foreground/40"}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
