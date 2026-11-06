import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  FileText,
  ClipboardCheck,
  Sparkles,
  ShieldCheck,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/course/influencer-com-ia")({
  component: InfluencerCoursePage,
});

type ModuleRow = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  video_url: string | null;
  pdf_path: string | null;
  sort_order: number | null;
  order_index?: number | null;
};

const COURSE_SLUG = "influencer-com-ia";
const PASS = 70;

const MODULE_FIELDS_FULL =
  "id, title, description, duration_minutes, video_url, pdf_path, sort_order, order_index";
const MODULE_FIELDS_MIN =
  "id, title, description, duration_minutes, video_url, pdf_path, sort_order";

const FALLBACK_CHECKLIST = [
  "Defini arquétipo e promessa central da influenciadora",
  "Gerei o seed mestre do rosto com 4 ângulos",
  "Escrevi o roteiro com dor, cena e produto",
  "Revisei a sincronia labial do vídeo final",
  "Publiquei o teste e anotei as métricas",
];

function normalizeOrder(rows: ModuleRow[]): ModuleRow[] {
  const copy = rows.slice();
  copy.sort((a, b) => {
    const av = a.order_index ?? a.sort_order ?? 0;
    const bv = b.order_index ?? b.sort_order ?? 0;
    return av - bv;
  });
  return copy.map((m, i) => ({
    ...m,
    order_index: m.order_index ?? m.sort_order ?? i + 1,
    sort_order: m.order_index ?? m.sort_order ?? i + 1,
  }));
}

async function fetchModulesFor(courseId: string): Promise<ModuleRow[]> {
  const first = await supabase
    .from("modules")
    .select(MODULE_FIELDS_FULL)
    .eq("course_id", courseId);

  if (!first.error && first.data) {
    return normalizeOrder(first.data as unknown as ModuleRow[]);
  }

  const second = await supabase
    .from("modules")
    .select(MODULE_FIELDS_MIN)
    .eq("course_id", courseId);

  if (second.error) throw second.error;
  return normalizeOrder((second.data ?? []) as unknown as ModuleRow[]);
}

async function resolveCourse() {
  const bySlug = await supabase
    .from("courses")
    .select("id, title, price")
    .eq("slug", COURSE_SLUG)
    .maybeSingle();

  if (!bySlug.error && bySlug.data)
    return bySlug.data as { id: string; title: string; price: number };

  const byTitle = await supabase
    .from("courses")
    .select("id, title, price")
    .ilike("title", "%influencer%")
    .limit(1)
    .maybeSingle();

  if (byTitle.error) throw byTitle.error;
  return (byTitle.data as { id: string; title: string; price: number } | null) ?? null;
}

function InfluencerCoursePage() {
  const qc = useQueryClient();
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [paid, setPaid] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    try {
      setPaid(window.localStorage.getItem("fcia:influencer-paid") === "1");
    } catch {
      setPaid(false);
    }
  }, []);

  const courseQuery = useQuery({
    queryKey: ["influencer-course"],
    staleTime: 60_000,
    queryFn: resolveCourse,
    retry: 1,
  });
  const course = courseQuery.data ?? null;

  const modulesQuery = useQuery({
    queryKey: ["influencer-modules", course?.id ?? "none"],
    enabled: courseQuery.isFetched,
    staleTime: 30_000,
    retry: 1,
    queryFn: async () => {
      if (!course?.id) return [];
      const rows = await fetchModulesFor(course.id);
      if (rows.length > 0) return rows;

      const { data: alt } = await supabase
        .from("courses")
        .select("id, title")
        .ilike("title", "%influencer%");
      for (const c of (alt ?? []) as Array<{ id: string }>) {
        if (c.id === course.id) continue;
        const found = await fetchModulesFor(c.id);
        if (found.length > 0) return found;
      }
      return [];
    },
  });

  const modules = useMemo(() => normalizeOrder(modulesQuery.data ?? []), [modulesQuery.data]);
  const safeIdx = modules.length ? Math.min(activeIdx, modules.length - 1) : 0;
  const active = modules[safeIdx];

  const meQuery = useQuery({
    queryKey: ["influencer-me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    retry: 0,
  });
  const userId = meQuery.data?.id ?? null;

  const attemptsQuery = useQuery({
    queryKey: ["influencer-attempts", userId],
    enabled: Boolean(userId),
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("module_id, score, passed")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []) as Array<{ module_id: string; score: number; passed: boolean }>;
    },
  });

  const passedIds = useMemo(() => {
    const set = new Set<string>();
    (attemptsQuery.data ?? []).forEach((a) => {
      if (a.passed || Number(a.score) >= PASS) set.add(a.module_id);
    });
    return set;
  }, [attemptsQuery.data]);

  function unlocked(index: number) {
    if (index <= 0) return true;
    const prev = modules[index - 1];
    return Boolean(prev && passedIds.has(prev.id));
  }

  const activeUnlocked = modules.length ? unlocked(safeIdx) : true;
  const done = modules.filter((m) => passedIds.has(m.id)).length;
  const percent = modules.length ? Math.round((done / modules.length) * 100) : 0;

  const questionsQuery = useQuery({
    queryKey: ["influencer-questions", active?.id],
    enabled: Boolean(activeUnlocked && active?.id),
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, question, options, correct_answer")
        .eq("module_id", active!.id);
      if (error) throw error;
      return ((data ?? []) as Array<{
        id: string;
        question: string;
        options: unknown;
        correct_answer: string;
      }>).map((q) => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
        correct_answer: q.correct_answer,
      }));
    },
  });

  useEffect(() => {
    setAnswers({});
    setResult(null);
    try {
      const raw = window.localStorage.getItem("fcia:check:" + (active?.id ?? ""));
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
  }, [active?.id]);

  function toggleCheck(i: number) {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try {
        window.localStorage.setItem("fcia:check:" + (active?.id ?? ""), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function submitQuiz() {
    const qs = questionsQuery.data ?? [];
    if (!qs.length || !active) return;
    if (!userId) {
      toast.error("Entre na sua conta para registrar o quiz");
      return;
    }
    setSubmitting(true);
    try {
      const correct = qs.filter((q) => answers[q.id] === q.correct_answer).length;
      const score = Math.round((correct / qs.length) * 100);
      const passed = score >= PASS;
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: userId,
        module_id: active.id,
        score,
        passed,
        correct_count: correct,
        total_questions: qs.length,
      });
      if (error) throw error;
      setResult({ score, passed });
      await qc.invalidateQueries({ queryKey: ["influencer-attempts", userId] });
      toast[passed ? "success" : "error"](
        passed ? `Aprovada com ${score}% — próximo módulo liberado` : `Nota ${score}% — mínimo ${PASS}%`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível registrar o quiz");
    } finally {
      setSubmitting(false);
    }
  }

  async function payNow() {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    try {
      window.localStorage.setItem("fcia:influencer-paid", "1");
    } catch {
      /* ignore */
    }
    setPaid(true);
    setProcessing(false);
    setCheckoutOpen(false);
    toast.success("Pagamento aprovado — curso liberado");
  }

  const price = Number(course?.price ?? 97);
  const totalLabel = String(modules.length || 5).padStart(2, "0");

  return (
    <div className="relative min-h-screen bg-[#0A0F1C] text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr] lg:py-12">
        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
            FCIA Academy
          </p>
          <h1 className="mt-2 font-display text-lg font-semibold leading-snug text-white">
            {course?.title ?? "Influencer com IA"}
          </h1>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-400">
              <span>Progresso</span>
              <span className="font-semibold tabular-nums text-cyan-300">{percent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400"
                style={{ width: percent + "%" }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {done} de {modules.length} módulos concluídos
            </p>
          </div>

          <nav className="mt-5 space-y-1">
            {modulesQuery.isLoading && (
              <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando módulos...
              </div>
            )}
            {modulesQuery.isError && (
              <p className="px-3 py-2 text-[12px] leading-relaxed text-fuchsia-300">
                Não foi possível carregar os módulos:{" "}
                {modulesQuery.error instanceof Error ? modulesQuery.error.message : "erro de rede"}
              </p>
            )}
            {!modulesQuery.isLoading && modules.length === 0 && (
              <p className="px-3 py-2 text-[12px] leading-relaxed text-slate-400">
                Nenhum módulo vinculado a este curso ainda. Confira em /admin/modulos qual curso
                está selecionado.
              </p>
            )}
            {modules.map((mod, i) => {
              const open = unlocked(i);
              const current = i === safeIdx;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
                    current
                      ? "border-cyan-400/40 bg-cyan-400/10"
                      : "border-transparent hover:border-white/10 hover:bg-white/[0.06]",
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {!open ? (
                      <Lock className="h-3.5 w-3.5 text-slate-500" />
                    ) : passedIds.has(mod.id) ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
                    ) : (
                      <PlayCircle className="h-3.5 w-3.5 text-fuchsia-300" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Módulo {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[13px] leading-snug",
                        current ? "font-semibold text-white" : "text-slate-300",
                      )}
                    >
                      {mod.title}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {!paid && (
            <Button
              onClick={() => setCheckoutOpen(true)}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90"
            >
              Liberar acesso
            </Button>
          )}
        </aside>

        <main className="min-w-0 space-y-6">
          <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles className="h-3 w-3" /> Módulo {String(safeIdx + 1).padStart(2, "0")} /{" "}
                {totalLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                <ShieldCheck className="h-3 w-3" /> {active?.duration_minutes ?? 25} min
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {active?.title ?? "Influencer com IA"}
            </h2>
            {active?.description && (
              <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-slate-400">
                {active.description}
              </p>
            )}
          </header>

          <section className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black/70">
            {active?.video_url ? (
              <video
                key={active.video_url}
                src={active.video_url}
                controls
                playsInline
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                <PlayCircle className="h-12 w-12 text-cyan-300/70" />
                <p className="text-sm text-slate-300">
                  {active ? `Videoaula — ${active.title}` : "Nenhum módulo disponível"}
                </p>
                <p className="max-w-md text-xs text-slate-500">
                  O vídeo aparece aqui assim que o professor publicar no painel de produção.
                </p>
              </div>
            )}
            {active && !activeUnlocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#070B14]/85 px-6 text-center backdrop-blur-sm">
                <Lock className="h-8 w-8 text-fuchsia-300" />
                <p className="font-display text-lg font-semibold text-white">Módulo bloqueado</p>
                <p className="max-w-sm text-xs text-slate-400">
                  Conclua o quiz do módulo anterior com {PASS}% ou mais para desbloquear.
                </p>
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <FileText className="h-3.5 w-3.5 text-cyan-300" /> Material em PDF
              </div>
              <div className="mt-4 flex aspect-[4/5] max-h-[320px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-[#070B14]/60 text-center">
                <FileText className="h-9 w-9 text-slate-600" />
                <p className="text-xs text-slate-400">Apostila do módulo</p>
                <p className="max-w-[22ch] text-[11px] text-slate-600">
                  Visualizador de PDF do módulo {String(safeIdx + 1).padStart(2, "0")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-full border-white/20 bg-transparent text-slate-200 hover:bg-white/10"
                  disabled={!active || !activeUnlocked}
                >
                  Abrir PDF
                </Button>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <ClipboardCheck className="h-3.5 w-3.5 text-fuchsia-300" /> Checklist de prática
              </div>
              <ul className="mt-4 space-y-2">
                {FALLBACK_CHECKLIST.map((item, i) => (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => toggleCheck(i)}
                      className="flex w-full items-start gap-2.5 rounded-xl border border-white/5 px-3 py-2 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          checked[i] ? "border-cyan-400 bg-cyan-400/20" : "border-white/20",
                        )}
                      >
                        {checked[i] ? <CheckCircle2 className="h-3 w-3 text-cyan-300" /> : null}
                      </span>
                      <span
                        className={cn(
                          "text-[12.5px] leading-snug",
                          checked[i] ? "text-slate-500 line-through" : "text-slate-300",
                        )}
                      >
                        {item}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-7">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" /> Quiz do módulo
            </div>

            {!active ? (
              <p className="mt-4 text-sm text-slate-400">
                O quiz fica disponível quando houver um módulo publicado.
              </p>
            ) : !activeUnlocked ? (
              <p className="mt-4 text-sm text-slate-400">
                O quiz fica disponível quando o módulo for liberado.
              </p>
            ) : questionsQuery.isLoading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando questões...
              </div>
            ) : (questionsQuery.data ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">
                As questões deste módulo ainda não foram publicadas.
              </p>
            ) : (
              <div className="mt-5 space-y-5">
                {(questionsQuery.data ?? []).map((q, qi) => (
                  <div key={q.id} className="rounded-2xl border border-white/10 bg-[#070B14]/50 p-4">
                    <p className="text-sm font-medium text-white">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="mt-3 space-y-1.5">
                      {q.options.map((opt) => {
                        const sel = answers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[13px] transition",
                              sel
                                ? "border-cyan-400/50 bg-cyan-400/10 text-white"
                                : "border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.05]",
                            )}
                          >
                            <span
                              className={cn(
                                "h-2.5 w-2.5 shrink-0 rounded-full border",
                                sel ? "border-cyan-300 bg-cyan-300" : "border-white/30",
                              )}
                            />
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={submitQuiz}
                    disabled={
                      submitting || Object.keys(answers).length < (questionsQuery.data ?? []).length
                    }
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90"
                  >
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Enviar
                    respostas
                  </Button>
                  {result && (
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        result.passed ? "text-cyan-300" : "text-fuchsia-300",
                      )}
                    >
                      Nota: {result.score}% {result.passed ? "· aprovada" : `· mínimo ${PASS}%`}
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0A0F1C] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 text-slate-500 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Checkout Asaas
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold text-white">
              {course?.title ?? "Influencer com IA"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">Pagamento único via PIX · acesso imediato</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Curso completo</span>
                <span className="font-mono text-white">R$ {price.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="font-semibold text-white">Total</span>
                <span className="font-display text-lg font-semibold text-cyan-300">
                  R$ {price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
            <Button
              onClick={payNow}
              disabled={processing}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90"
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              {processing ? "Confirmando PIX..." : "Pagar com PIX"}
            </Button>
            <p className="mt-3 text-center text-[10.5px] leading-relaxed text-slate-500">
              Simulação do webhook PAYMENT_RECEIVED do Asaas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
