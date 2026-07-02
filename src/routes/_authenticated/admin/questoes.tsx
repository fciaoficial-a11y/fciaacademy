import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminCoursesQuery,
  adminModulesQuery,
  adminQuestionsQuery,
  deleteRow,
  insertRow,
  questionCoverageQuery,
  updateRow,
  type AdminQuestion,
} from "@/lib/admin-api";
import { generateQuestionBank } from "@/lib/ai-studio.functions";

export const Route = createFileRoute("/_authenticated/admin/questoes")({
  component: AdminQuestionsPage,
});

type Draft = Partial<AdminQuestion>;
const empty: Draft = {
  question: "",
  type: "multiple_choice",
  options: ["", "", "", ""],
  correct_answer: "",
  explanation: "",
  sort_order: 0,
  difficulty: "medium",
  status: "approved",
  source_type: "manual",
  topic: "",
};

const MIN_PER_COURSE = 20;

function AdminQuestionsPage() {
  const qc = useQueryClient();
  const questions = useQuery(adminQuestionsQuery);
  const modules = useQuery(adminModulesQuery);
  const courses = useQuery(adminCoursesQuery);
  const coverage = useQuery(questionCoverageQuery);

  const [courseFilter, setCourseFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "questions"] });
    qc.invalidateQueries({ queryKey: ["admin", "question-coverage"] });
  };

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      if (!d.module_id) throw new Error("Selecione um módulo.");
      const mod = modules.data?.find((m) => m.id === d.module_id);
      const payload: Record<string, unknown> = {
        ...d,
        course_id: d.course_id ?? mod?.course_id ?? null,
        options:
          d.type === "true_false" ? ["Verdadeiro", "Falso"] : (d.options ?? []).filter(Boolean),
      };
      if (d.id) await updateRow("questions", d.id, payload);
      else await insertRow("questions", payload);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Questão salva.");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteRow("questions", id),
    onSuccess: () => {
      invalidate();
      toast.success("Questão excluída.");
    },
  });

  const approve = useMutation({
    mutationFn: (id: string) => updateRow("questions", id, { status: "approved" }),
    onSuccess: () => {
      invalidate();
      toast.success("Aprovada.");
    },
  });

  const filtered = useMemo(() => {
    return (questions.data ?? []).filter((q) => {
      if (courseFilter && q.course_id !== courseFilter) return false;
      if (moduleFilter && q.module_id !== moduleFilter) return false;
      if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
      if (statusFilter && q.status !== statusFilter) return false;
      return true;
    });
  }, [questions.data, courseFilter, moduleFilter, difficultyFilter, statusFilter]);

  // Cobertura agregada por curso
  const courseCoverage = useMemo(() => {
    const map = new Map<string, { title: string; approved: number; draft: number }>();
    for (const c of coverage.data ?? []) {
      const cur = map.get(c.course_id) ?? { title: c.course_title, approved: 0, draft: 0 };
      cur.approved += Number(c.approved_count) || 0;
      cur.draft += Number(c.draft_count) || 0;
      map.set(c.course_id, cur);
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [coverage.data]);

  const modulesForCourse = modules.data?.filter(
    (m) => !courseFilter || m.course_id === courseFilter,
  );

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Banco de questões</h1>
          <p className="text-sm text-muted-foreground">
            Questões persistentes. Provas são montadas aleatoriamente sem chamar IA.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setAiOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> Gerar com IA
          </Button>
          <Button
            onClick={() => {
              setEditing({
                ...empty,
                course_id: courseFilter || courses.data?.[0]?.id,
                module_id: moduleFilter || modulesForCourse?.[0]?.id,
              });
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova
          </Button>
        </div>
      </header>

      {/* Cobertura */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courseCoverage.map((c) => {
          const pct = Math.min(100, Math.round((c.approved / MIN_PER_COURSE) * 100));
          const ok = c.approved >= MIN_PER_COURSE;
          return (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-card/60 p-4 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{c.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                    ok
                      ? "bg-primary/15 text-primary"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {c.approved}/{MIN_PER_COURSE}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full ${ok ? "bg-primary" : "bg-destructive"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {c.approved} aprovadas · {c.draft} em rascunho
              </p>
            </div>
          );
        })}
      </section>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap gap-2">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setModuleFilter("");
          }}
        >
          <option value="">Todos os cursos</option>
          {courses.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="">Todos os módulos</option>
          {modulesForCourse?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Todas dificuldades</option>
          <option value="easy">Fácil</option>
          <option value="medium">Média</option>
          <option value="hard">Difícil</option>
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos status</option>
          <option value="approved">Aprovadas</option>
          <option value="draft">Rascunho</option>
          <option value="archived">Arquivadas</option>
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Pergunta</th>
              <th className="px-4 py-3">Módulo</th>
              <th className="px-4 py-3">Dif.</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Uso</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((q) => (
              <tr key={q.id}>
                <td className="px-4 py-3">
                  <p className="line-clamp-2 font-medium">{q.question}</p>
                  {q.topic && (
                    <p className="text-[11px] text-muted-foreground">#{q.topic}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {modules.data?.find((m) => m.id === q.module_id)?.title ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs capitalize">{q.difficulty}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                      q.status === "approved"
                        ? "bg-primary/15 text-primary"
                        : q.status === "draft"
                          ? "bg-yellow-500/15 text-yellow-500"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{q.times_used}</td>
                <td className="px-4 py-3 text-right">
                  {q.status !== "approved" && (
                    <Button variant="ghost" size="icon" onClick={() => approve.mutate(q.id)}>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing({ ...q, options: q.options ?? [] });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Excluir questão?")) del.mutate(q.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {!filtered.length && !questions.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma questão encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog: editar/nova */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar questão" : "Nova questão"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Curso">
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing.course_id ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, course_id: e.target.value, module_id: "" })
                    }
                  >
                    <option value="">Selecione…</option>
                    {courses.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Módulo">
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing.module_id ?? ""}
                    onChange={(e) => setEditing({ ...editing, module_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione…</option>
                    {modules.data
                      ?.filter((m) => !editing.course_id || m.course_id === editing.course_id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                  </select>
                </Field>
              </div>
              <Field label="Pergunta">
                <Textarea
                  rows={2}
                  value={editing.question ?? ""}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  required
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Tipo">
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing.type ?? "multiple_choice"}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        type: e.target.value,
                        options:
                          e.target.value === "true_false"
                            ? ["Verdadeiro", "Falso"]
                            : ["", "", "", ""],
                      })
                    }
                  >
                    <option value="multiple_choice">Múltipla</option>
                    <option value="true_false">V/F</option>
                  </select>
                </Field>
                <Field label="Dificuldade">
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing.difficulty ?? "medium"}
                    onChange={(e) =>
                      setEditing({ ...editing, difficulty: e.target.value as any })
                    }
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Média</option>
                    <option value="hard">Difícil</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing.status ?? "approved"}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                  >
                    <option value="approved">Aprovada</option>
                    <option value="draft">Rascunho</option>
                    <option value="archived">Arquivada</option>
                  </select>
                </Field>
              </div>
              <Field label="Tópico (opcional)">
                <Input
                  value={editing.topic ?? ""}
                  onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                />
              </Field>
              {editing.type !== "true_false" && (
                <Field label="Alternativas">
                  <div className="grid gap-2">
                    {(editing.options ?? []).map((opt, i) => (
                      <Input
                        key={i}
                        value={opt}
                        placeholder={`Alternativa ${i + 1}`}
                        onChange={(e) => {
                          const next = [...(editing.options ?? [])];
                          next[i] = e.target.value;
                          setEditing({ ...editing, options: next });
                        }}
                      />
                    ))}
                  </div>
                </Field>
              )}
              <Field label="Resposta correta">
                {editing.type === "true_false" ? (
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing.correct_answer ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, correct_answer: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione…</option>
                    <option value="Verdadeiro">Verdadeiro</option>
                    <option value="Falso">Falso</option>
                  </select>
                ) : (
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing.correct_answer ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, correct_answer: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione…</option>
                    {(editing.options ?? []).filter(Boolean).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Explicação (opcional)">
                <Textarea
                  rows={2}
                  value={editing.explanation ?? ""}
                  onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
                />
              </Field>
              <DialogFooter>
                <Button type="submit" disabled={save.isPending}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AiGenerateDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        defaultCourseId={courseFilter || courses.data?.[0]?.id || ""}
        defaultModuleId={moduleFilter || ""}
        onDone={invalidate}
      />
    </div>
  );
}

function AiGenerateDialog({
  open,
  onOpenChange,
  defaultCourseId,
  defaultModuleId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCourseId: string;
  defaultModuleId: string;
  onDone: () => void;
}) {
  const courses = useQuery(adminCoursesQuery);
  const modules = useQuery(adminModulesQuery);
  const [courseId, setCourseId] = useState(defaultCourseId);
  const [moduleId, setModuleId] = useState(defaultModuleId);
  const [count, setCount] = useState(10);
  const [autoApprove, setAutoApprove] = useState(false);
  const [extra, setExtra] = useState("");
  const gen = useServerFn(generateQuestionBank);

  const run = useMutation({
    mutationFn: () =>
      gen({
        data: {
          course_id: courseId,
          module_id: moduleId || null,
          count,
          difficulty_mix: true,
          source_type: "ai",
          auto_approve: autoApprove,
          extra_context: extra,
        },
      }),
    onSuccess: (r: any) => {
      toast.success(
        `${r.inserted} questões geradas${r.auto_approved ? " e aprovadas" : " como rascunho"}.`,
      );
      onDone();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerar questões com IA</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Curso">
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setModuleId("");
              }}
            >
              <option value="">Selecione…</option>
              {courses.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Módulo (opcional — vazio = curso inteiro)">
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
            >
              <option value="">Todos os módulos do curso</option>
              {modules.data
                ?.filter((m) => m.course_id === courseId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total (aprox.)">
              <Input
                type="number"
                min={3}
                max={30}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </Field>
            <Field label="Aprovar direto?">
              <label className="mt-2 inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                />
                Sim, pular revisão
              </label>
            </Field>
          </div>
          <Field label="Contexto extra (opcional)">
            <Textarea
              rows={3}
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Trecho da apostila, foco temático, etc."
            />
          </Field>
          <DialogFooter>
            <Button
              onClick={() => run.mutate()}
              disabled={!courseId || run.isPending}
            >
              {run.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Gerar
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
