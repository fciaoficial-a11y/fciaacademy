import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ModuleArticle } from "@/components/learn/ModuleArticle";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  PlayCircle,
  BookOpen,
  Lock,
  Menu,
  ArrowUpToLine,
  Share2,
  Type,
  Focus,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

import { courseLearnQuery, progressQuery, type CourseDetail, type ModuleRow } from "@/lib/learn-queries";
import { eligibilityQuery } from "@/lib/quiz-queries";
import { enrollInCourse, enrollmentQuery } from "@/lib/enrollments";
import { PixCheckout } from "@/components/payments/PixCheckout";
import { PdfViewer } from "@/components/learn/PdfViewer";
import { getModulePdfUrl } from "@/lib/pdf.functions";
import { getModuleIntroVideoUrl } from "@/lib/video.functions";

import { toast } from "sonner";



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
  const [studentLabel, setStudentLabel] = useState<string>("Aluno");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUserId(u?.id);
      const meta = (u?.user_metadata ?? {}) as { full_name?: string; name?: string };
      setStudentLabel(meta.full_name || meta.name || u?.email || "Aluno");
    });
  }, []);

  if (!data) return null;
  const { course, modules } = data;

  const enrollmentQ = useQuery(enrollmentQuery(course.id, userId));

  const isPurchaseCourse = !course.is_free && course.price > 0;
  const hasEnrollment = !!enrollmentQ.data;
  // Regra única: curso gratuito (is_free) → acesso livre; curso pago → precisa de enrollment (criado pelo webhook após pagamento).
  const hasAccess = isPurchaseCourse ? hasEnrollment : true;


  useEffect(() => {
    if (!userId || isPurchaseCourse) return;
    if (enrollmentQ.isFetched && !enrollmentQ.data) {
      enrollInCourse(course.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ["enrollment", course.id, userId] }))
        .catch(() => {});
    }
  }, [userId, isPurchaseCourse, enrollmentQ.isFetched, enrollmentQ.data, course.id, queryClient]);

  const progress = useQuery(progressQuery(course.id, hasAccess ? userId : undefined));
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

  const eligibility = useQuery(eligibilityQuery(hasAccess ? course.id : undefined, userId));

  const markComplete = useMutation({
    mutationFn: async (mod: ModuleRow) => {
      if (!userId) throw new Error("Não autenticado");
      const { error } = await supabase.rpc("mark_module_complete", { _module_id: mod.id });
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["progress", course.id, userId] }),
        queryClient.invalidateQueries({ queryKey: ["quiz-eligibility", course.id, userId] }),
      ]);
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível concluir o módulo."),
  });

  if (!hasAccess) {
    return <Paywall course={course} />;
  }

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

  // Preferências locais de leitura
  const [fontScale, setFontScale] = useState<number>(1);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [justCompleted, setJustCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = Number(window.localStorage.getItem("fcia-reader-scale"));
    if (!Number.isNaN(s) && s >= 0.9 && s <= 1.3) setFontScale(s);
    setFocusMode(window.localStorage.getItem("fcia-reader-focus") === "1");
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("fcia-reader-scale", String(fontScale));
  }, [fontScale]);
  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("fcia-reader-focus", focusMode ? "1" : "0");
  }, [focusMode]);

  // Sempre que trocar de módulo, sobe ao topo e fecha o drawer
  useEffect(() => {
    setDrawerOpen(false);
    setScrollProgress(0);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeModule?.id]);

  // Progresso de leitura por scroll (delight sutil e útil)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      setScrollProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeModule?.id]);

  const shareModule = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const shareData = { title: `${course.title} — ${activeModule.title}`, text: activeModule.title, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado");
      }
    } catch {
      /* usuário cancelou */
    }
  };

  const cycleFont = () => {
    setFontScale((s) => {
      const next = Number((s + 0.1).toFixed(2));
      return next > 1.3 ? 0.9 : next;
    });
  };

  // Atalhos de teclado — sem fricção
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && next) { e.preventDefault(); setActive(next.slug); }
      else if (e.key === "ArrowLeft" && prev) { e.preventDefault(); setActive(prev.slug); }
      else if (e.key.toLowerCase() === "f") { e.preventDefault(); setFocusMode((v) => !v); }
      else if (e.key.toLowerCase() === "m") { e.preventDefault(); setDrawerOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const handleMarkComplete = () => {
    if (isComplete || !userId) return;
    markComplete.mutate(activeModule, {
      onSuccess: () => {
        setJustCompleted(true);
        toast.success("Módulo concluído", { description: "Sua jornada avançou." });
        window.setTimeout(() => setJustCompleted(false), 1200);
      },
    });
  };


  const ModuleList = (
    <nav className="space-y-px">
      {modules.map((m, i) => {
        const done = progressMap.get(m.id) ?? false;
        const active = m.id === activeModule.id;
        return (
          <button
            key={m.id}
            onClick={() => setActive(m.slug)}
            className={cn(
              "group relative flex w-full items-start gap-2 py-1.5 pl-3 pr-2 text-left transition-colors",
              active
                ? "bg-foreground/[0.07] dark:bg-foreground/[0.10]"
                : "hover:bg-foreground/[0.03] dark:hover:bg-foreground/[0.045]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1 bottom-1 w-[2px]",
                active ? "bg-primary" : "bg-transparent",
              )}
            />
            {done ? (
              <CheckCircle2 className="mt-[3px] h-3 w-3 shrink-0 text-primary" />
            ) : (
              <Circle
                className={cn(
                  "mt-[3px] h-3 w-3 shrink-0",
                  active ? "text-foreground/70" : "text-muted-foreground/50",
                )}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-muted-foreground/30">·</span>
                <span className="inline-flex items-center gap-1">
                  <ModuleTypeIcon type={m.content_type} />
                  {m.duration_minutes}m
                </span>
              </div>
              <p
                className={cn(
                  "mt-px truncate text-[12.5px] leading-snug",
                  active ? "font-semibold text-foreground" : "font-normal text-foreground/70",
                )}
              >
                {m.title}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top reader toolbar */}
      <div className="sticky top-[41px] z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-6">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full lg:hidden"
                aria-label="Abrir lista de módulos"
              >
                <Menu className="h-4 w-4" />
                <span className="text-xs">Módulos</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto p-5">
              <SheetHeader>
                <SheetTitle className="text-left font-display text-base leading-tight">
                  {course.title}
                </SheetTitle>
              </SheetHeader>
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
              <div className="mt-5">{ModuleList}</div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
              Módulo {activeIndex + 1} de {modules.length}
            </p>
            <p className="truncate text-sm font-medium">{activeModule.title}</p>
          </div>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 sm:flex">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={cycleFont}
                title={`Tamanho do texto (${Math.round(fontScale * 100)}%)`}
                aria-label="Ajustar tamanho do texto"
                className="rounded-full"
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={focusMode ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setFocusMode((v) => !v)}
                title={focusMode ? "Sair do modo foco" : "Modo foco"}
                aria-label="Alternar modo foco"
                className="rounded-full"
              >
                <Focus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={shareModule}
                title="Compartilhar módulo"
                aria-label="Compartilhar módulo"
                className="rounded-full"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Progresso de leitura por scroll — feedback contínuo */}
        <div className="relative h-[3px] w-full overflow-hidden bg-transparent">
          <div
            className="absolute inset-y-0 left-0 bg-foreground/[0.06]"
            style={{ width: `${percent}%` }}
            aria-hidden
          />
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-accent transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
            aria-hidden
          />
        </div>
      </div>

      <div
        className={cn(
          "mx-auto grid max-w-7xl gap-0 px-0 lg:gap-0",
          focusMode ? "lg:grid-cols-1" : "lg:grid-cols-[248px_1fr]",
        )}
      >
        <aside
          className={cn(
            "hidden lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto",
            focusMode ? "lg:hidden" : "lg:block",
            "lg:border-r lg:border-border/60 lg:bg-foreground/[0.015] dark:lg:bg-foreground/[0.025] lg:py-6",
          )}
        >
          <div className="px-4">
            <Link
              to="/cursos"
              className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Catálogo
            </Link>
            <h2 className="mt-3 font-display text-[13.5px] font-semibold leading-snug text-foreground/90">
              {course.title}
            </h2>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                <span>Progresso</span>
                <span className="font-semibold tabular-nums text-foreground">{percent}%</span>
              </div>
              <Progress value={percent} className="h-[3px]" />
              <p className="text-[10.5px] text-muted-foreground/70">
                {completedCount} de {modules.length} módulos
              </p>
            </div>
            {course.full_pdf_path && (
              <FullPdfDownload path={course.full_pdf_path} title={course.title} />
            )}
          </div>

          <div className="mt-6 border-t border-border/50 pt-4">
            <p className="mb-2 px-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/60">
              Módulos
            </p>
            {ModuleList}
          </div>
        </aside>

        <section
          className={cn(
            "min-w-0 px-4 py-8 sm:px-8 sm:py-12 lg:px-14 lg:py-14",
            focusMode && "mx-auto w-full max-w-3xl",
          )}
          style={{ fontSize: `${fontScale}rem` }}
        >
          <div key={activeModule.id} className="animate-fade-in-soft">
            {/* Hero editorial do módulo — com aura sutil */}
            <header className="relative mb-12 pb-8 border-b border-border/50">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl dark:bg-accent/20"
              />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground shadow-sm backdrop-blur dark:bg-foreground/[0.04]">
                  <span className="text-primary">Módulo {String(activeIndex + 1).padStart(2, "0")}</span>
                  <span className="text-muted-foreground/30">/</span>
                  <span>{String(modules.length).padStart(2, "0")}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="inline-flex items-center gap-1">
                    <ModuleTypeIcon type={activeModule.content_type} />
                    {activeModule.content_type === "video"
                      ? "Vídeo"
                      : activeModule.content_type === "pdf"
                        ? "PDF"
                        : "Leitura"}
                  </span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {activeModule.duration_minutes} min
                  </span>
                  {isComplete && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="inline-flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-3 w-3" /> Concluído
                      </span>
                    </>
                  )}
                </div>
                <h1 className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[2.9rem]">
                  {activeModule.title}
                </h1>
                {activeModule.description && (
                  <p className="mt-5 max-w-[58ch] text-lg leading-[1.6] text-muted-foreground sm:text-[1.2rem]">
                    {activeModule.description}
                  </p>
                )}
              </div>
            </header>

            {activeModule.intro_video_path && (
              <div className="mb-6">
                <IntroVideoBlock moduleId={activeModule.id} title={activeModule.title} />
              </div>
            )}

            <ModuleContent
              module={activeModule}
              course={course}
              studentLabel={studentLabel}
              completed={isComplete}
              onComplete={handleMarkComplete}
            />

            {activeModule.complementary_content?.trim() && (
              <section className="mt-10">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  <span className="h-px w-8 bg-border" />
                  Material complementar
                </div>
                <ModuleArticle markdown={activeModule.complementary_content} />
              </section>
            )}

            {activeModule.content_type !== "pdf" && (
              <div className="mt-6">
                <ComplementaryPdf
                  module={activeModule}
                  course={course}
                  studentLabel={studentLabel}
                  completed={isComplete}
                  onComplete={handleMarkComplete}
                />
              </div>
            )}

          </div>

          {/* Próximo módulo — convite calmo ao avanço */}
          {next && (
            <button
              type="button"
              onClick={() => setActive(next.slug)}
              className="group mt-10 flex w-full items-center gap-4 rounded-2xl border border-border/70 bg-card/50 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-md sm:p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                  Próximo módulo · {String(activeIndex + 2).padStart(2, "0")} / {String(modules.length).padStart(2, "0")}
                </p>
                <p className="mt-1 truncate font-display text-lg font-semibold tracking-tight text-foreground">
                  {next.title}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ModuleTypeIcon type={next.content_type} />
                  <span>{next.duration_minutes} min</span>
                </p>
              </div>
            </button>
          )}

          {/* Barra de ação — sticky no mobile */}
          <div className="mt-8 sticky bottom-3 z-20 space-y-3 rounded-2xl border border-border bg-card/95 p-3 sm:p-4 shadow-lg reader-focus-ring backdrop-blur">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
              <Button
                onClick={handleMarkComplete}
                disabled={!userId || isComplete || markComplete.isPending}
                variant={isComplete ? "secondary" : "default"}
                className={cn(
                  "col-span-2 rounded-full transition-all sm:col-span-1",
                  justCompleted && "animate-checkmark-pop",
                )}
              >
                {isComplete ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Concluído
                  </>
                ) : markComplete.isPending ? (
                  "Concluindo…"
                ) : (
                  "Marcar concluído"
                )}
              </Button>

              <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1">
                {eligibility.data?.quiz_unlocked ? (
                  <Button asChild variant="secondary" className="rounded-full">
                    <Link to="/quiz/$moduleId" params={{ moduleId: activeModule.id }}>
                      Fazer quiz final
                    </Link>
                  </Button>
                ) : (
                  <Button variant="secondary" className="rounded-full" disabled>
                    <Lock className="mr-2 h-4 w-4" /> Quiz bloqueado
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={!prev}
                  onClick={() => prev && setActive(prev.slug)}
                  title="Módulo anterior (←)"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Anterior
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={!next}
                  onClick={() => next && setActive(next.slug)}
                  title="Próximo módulo (→)"
                >
                  Próximo <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Voltar ao topo"
                  onClick={() =>
                    typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  <ArrowUpToLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {eligibility.data && !eligibility.data.quiz_unlocked && (
              <p className="text-xs text-muted-foreground">
                Conclua todos os módulos para liberar o quiz final ({eligibility.data.completed_required_modules}/{eligibility.data.total_required_modules} concluídos).
              </p>
            )}
            {eligibility.data?.quiz_unlocked && completedCount === modules.length && (
              <p className="text-xs text-primary">Curso concluído. Seu quiz final foi liberado.</p>
            )}
          </div>

          <footer className="mt-10 flex flex-col items-center gap-1 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.28em]">FCIA Academy</span>
            <span className="text-[10px] text-muted-foreground/60">
              Dica: use <kbd className="rounded border border-border/60 bg-muted/40 px-1 font-mono text-[9px]">←</kbd> <kbd className="rounded border border-border/60 bg-muted/40 px-1 font-mono text-[9px]">→</kbd> para navegar · <kbd className="rounded border border-border/60 bg-muted/40 px-1 font-mono text-[9px]">F</kbd> foco · <kbd className="rounded border border-border/60 bg-muted/40 px-1 font-mono text-[9px]">M</kbd> módulos
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}



function ModuleTypeIcon({ type }: { type: ModuleRow["content_type"] }) {
  if (type === "video") return <PlayCircle className="h-3.5 w-3.5" />;
  if (type === "pdf") return <FileText className="h-3.5 w-3.5" />;
  return <BookOpen className="h-3.5 w-3.5" />;
}

function ModuleContent({
  module: mod,
  course,
  studentLabel,
  completed,
  onComplete,
}: {
  module: ModuleRow;
  course: CourseDetail;
  studentLabel: string;
  completed: boolean;
  onComplete: () => void;
}) {
  if (mod.content_type === "video") {
    if (mod.video_url) {
      return <StorageVideo path={mod.video_url} title={mod.title} />;
    }
    if (mod.content_url) {
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
  }

  if (mod.content_type === "pdf") {
    return (
      <SecurePdfModule
        moduleId={mod.id}
        studentLabel={studentLabel}
        allowDownload={course.allow_pdf_download}
        completed={completed}
        onComplete={onComplete}
      />
    );
  }
  if (mod.content_type === "text") {
    const md = mod.content_text?.trim();
    if (!md) {
      return (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          O conteúdo principal deste módulo será publicado em breve.
        </div>
      );
    }
    return <ModuleArticle markdown={md} />;
  }
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
      Conteúdo indisponível.
    </div>
  );
}

function ComplementaryPdf({
  module: mod,
  course,
  studentLabel,
  completed,
  onComplete,
}: {
  module: ModuleRow;
  course: CourseDetail;
  studentLabel: string;
  completed: boolean;
  onComplete: () => void;
}) {
  if (!mod.pdf_path) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">Material complementar</p>
        <p className="mt-1 text-sm text-muted-foreground">
          O PDF de apoio deste módulo será adicionado em breve.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <FileText className="h-3.5 w-3.5" /> Material complementar (PDF)
      </div>
      <SecurePdfModule
        moduleId={mod.id}
        studentLabel={studentLabel}
        allowDownload={course.allow_pdf_download}
        completed={completed}
        onComplete={onComplete}
      />
    </div>
  );
}

function SecurePdfModule({
  moduleId,
  studentLabel,
  allowDownload,
  completed,
  onComplete,
}: {
  moduleId: string;
  studentLabel: string;
  allowDownload: boolean;
  completed: boolean;
  onComplete: () => void;
}) {
  const [nonce, setNonce] = useState(0);
  const query = useQuery({
    queryKey: ["module-pdf", moduleId, nonce],
    queryFn: () => getModulePdfUrl({ data: { moduleId } }),
    staleTime: 4 * 60 * 1000,
    retry: false,
  });

  if (query.isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Preparando material seguro…
      </div>
    );
  }

  if (query.isError || !query.data?.url) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-card p-8 text-center text-sm">
        <p className="text-destructive">
          {(query.error as Error | undefined)?.message ?? "PDF indisponível."}
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => setNonce((n) => n + 1)}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <PdfViewer
      signedUrl={query.data.url}
      studentLabel={studentLabel}
      allowDownload={allowDownload}
      completed={completed}
      onComplete={onComplete}
      onReload={() => setNonce((n) => n + 1)}
    />
  );
}

function StorageVideo({ path, title }: { path: string; title: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    setError(null);
    async function resolve() {
      if (/^https?:\/\//i.test(path)) {
        if (!cancelled) setSrc(path);
        return;
      }
      const cleaned = path.replace(/^course-videos\//, "");
      const { data, error } = await supabase.storage
        .from("course-videos")
        .createSignedUrl(cleaned, 60 * 60);
      if (cancelled) return;
      if (error || !data?.signedUrl) {
        setError(error?.message ?? "Não foi possível carregar o vídeo.");
        return;
      }
      setSrc(data.signedUrl);
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }
  if (!src) {
    return <div className="aspect-video w-full animate-pulse rounded-2xl bg-card" />;
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
      <video
        key={src}
        src={src}
        title={title}
        controls
        controlsList="nodownload"
        playsInline
        className="h-full w-full"
      />
    </div>
  );
}

function IntroVideoBlock({ moduleId, title }: { moduleId: string; title: string }) {
  const [nonce, setNonce] = useState(0);
  const query = useQuery({
    queryKey: ["module-intro-video", moduleId, nonce],
    queryFn: () => getModuleIntroVideoUrl({ data: { moduleId } }),
    staleTime: 4 * 60 * 1000,
    retry: false,
  });

  if (query.isLoading) {
    return <div className="aspect-video w-full animate-pulse rounded-2xl bg-card" />;
  }
  if (query.isError || !query.data?.url) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-card p-4 text-center text-xs text-muted-foreground">
        Não foi possível carregar o vídeo deste módulo. Você ainda pode continuar pelo conteúdo abaixo.
        <div className="mt-2">
          <Button size="sm" variant="outline" onClick={() => setNonce((n) => n + 1)}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black">
      <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        Vídeo de abertura
      </div>
      <div className="aspect-video w-full">
        <video
          key={query.data.url}
          src={query.data.url}
          poster={query.data.poster ?? undefined}
          title={title}
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}


function Paywall({
  course,
}: {
  course: { id: string; title: string; description: string; track_title: string | null; price: number };
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <Lock className="h-3 w-3" /> Curso avulso
          </div>

          <h1 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">{course.title}</h1>
          {course.track_title && (
            <p className="mt-1 text-sm text-muted-foreground">Trilha: {course.track_title}</p>
          )}
          {course.description && (
            <p className="mt-4 text-base text-muted-foreground">{course.description}</p>
          )}

          <div className="mt-8 rounded-2xl border border-white/10 bg-background/50 p-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Compra avulsa deste curso</p>
            <p className="mt-1 font-display text-2xl font-semibold text-primary">
              R$ {course.price.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Pagamento único via PIX. O acesso é liberado automaticamente após a confirmação.
            </p>
          </div>

          <div className="mt-8">
            <PixCheckout mode="course" courseId={course.id} title={course.title} />
          </div>
        </div>
      </div>
    </div>
  );
}



