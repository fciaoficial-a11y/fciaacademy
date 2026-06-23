import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  attemptsQuery,
  quizQuery,
  PASS_THRESHOLD,
  type QuestionRow,
} from "@/lib/quiz-queries";

export const Route = createFileRoute("/_authenticated/quiz/$moduleId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(quizQuery(params.moduleId)).then((d) => {
      if (!d) throw notFound();
    }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold">Quiz não encontrado</h1>
      <Link to="/cursos" className="mt-6 inline-block text-sm text-primary hover:underline">
        Voltar ao catálogo
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-2xl">Erro ao carregar quiz.</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: QuizPage,
});

type Phase = "intro" | "playing" | "result";

function QuizPage() {
  const { moduleId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(quizQuery(moduleId));
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const attempts = useQuery(attemptsQuery(moduleId, userId));

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
    passed: boolean;
  } | null>(null);

  if (!data) return null;
  const { module: mod, course, questions } = data;

  const total = questions.length;
  const current = questions[index];
  const percent = total ? Math.round(((index + (phase === "result" ? 1 : 0)) / total) * 100) : 0;

  const saveAttempt = useMutation({
    mutationFn: async (payload: {
      score: number;
      correct: number;
      total: number;
      passed: boolean;
      answersPayload: { question_id: string; answer: string; correct: boolean }[];
    }) => {
      if (!userId) throw new Error("Não autenticado");
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: userId,
        module_id: mod.id,
        course_id: mod.course_id,
        score: payload.score,
        correct_count: payload.correct,
        total_questions: payload.total,
        passed: payload.passed,
        answers: payload.answersPayload,
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", moduleId, userId] }),
  });

  function start() {
    setAnswers({});
    setIndex(0);
    setSelected(null);
    setResult(null);
    setPhase("playing");
  }

  function confirmAnswer() {
    if (!current || !selected) return;
    const next = { ...answers, [current.id]: selected };
    setAnswers(next);
    if (index + 1 < total) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      finalize(next);
    }
  }

  function finalize(finalAnswers: Record<string, string>) {
    let correct = 0;
    const payload = questions.map((q) => {
      const ans = finalAnswers[q.id] ?? "";
      const ok = ans === q.correct_answer;
      if (ok) correct++;
      return { question_id: q.id, answer: ans, correct: ok };
    });
    const score = total ? Math.round((correct / total) * 100) : 0;
    const passed = score >= PASS_THRESHOLD;
    setResult({ score, correct, total, passed });
    setPhase("result");
    saveAttempt.mutate({ score, correct, total, passed, answersPayload: payload });
  }

  if (total === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">{mod.title}</h1>
        <p className="mt-3 text-muted-foreground">
          Este módulo ainda não possui perguntas cadastradas.
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-full">
          <Link to="/curso/$slug" params={{ slug: course.slug }} search={{ m: mod.slug }}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao curso
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to="/curso/$slug"
        params={{ slug: course.slug }}
        search={{ m: mod.slug }}
        className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {course.title}
      </Link>

      <header className="mt-3">
        <p className="text-xs uppercase tracking-widest text-primary">Quiz</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{mod.title}</h1>
      </header>

      {phase === "intro" && (
        <IntroCard
          total={total}
          attempts={attempts.data?.length ?? 0}
          bestScore={Math.max(0, ...(attempts.data?.map((a) => Number(a.score)) ?? [0]))}
          onStart={start}
        />
      )}

      {phase === "playing" && current && (
        <>
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Questão {index + 1} de {total}
              </span>
              <span>{percent}%</span>
            </div>
            <Progress value={percent} />
          </div>
          <QuestionCard
            question={current}
            selected={selected}
            onSelect={setSelected}
          />
          <div className="mt-6 flex justify-end">
            <Button
              onClick={confirmAnswer}
              disabled={!selected}
              className="rounded-full"
            >
              {index + 1 === total ? "Finalizar quiz" : "Próxima"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {phase === "result" && result && (
        <ResultCard
          result={result}
          questions={questions}
          answers={answers}
          saving={saveAttempt.isPending}
          onRetry={start}
          onBack={() =>
            navigate({
              to: "/curso/$slug",
              params: { slug: course.slug },
              search: { m: mod.slug },
            })
          }
        />
      )}
    </div>
  );
}

function IntroCard({
  total,
  attempts,
  bestScore,
  onStart,
}: {
  total: number;
  attempts: number;
  bestScore: number;
  onStart: () => void;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold">Pronto para começar?</h2>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>• {total} {total === 1 ? "questão" : "questões"}</li>
        <li>• Aprovação a partir de {PASS_THRESHOLD}%</li>
        <li>• Tentativas ilimitadas</li>
        {attempts > 0 && (
          <li>
            • Tentativas anteriores: <span className="text-foreground">{attempts}</span> · Melhor
            nota: <span className="text-foreground">{bestScore}%</span>
          </li>
        )}
      </ul>
      <Button onClick={onStart} className="mt-6 rounded-full">
        Iniciar quiz <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function QuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: QuestionRow;
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  const opts = useMemo(
    () => (question.type === "true_false" ? ["Verdadeiro", "Falso"] : question.options),
    [question]
  );
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold leading-snug">{question.question}</h2>
      <div className="mt-5 space-y-2">
        {opts.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background hover:bg-white/5"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {active && <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({
  result,
  questions,
  answers,
  saving,
  onRetry,
  onBack,
}: {
  result: { score: number; correct: number; total: number; passed: boolean };
  questions: QuestionRow[];
  answers: Record<string, string>;
  saving: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mt-8 space-y-5">
      <div
        className={`rounded-2xl border p-6 text-center ${
          result.passed
            ? "border-primary/40 bg-primary/10"
            : "border-destructive/40 bg-destructive/10"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background">
          {result.passed ? (
            <Trophy className="h-7 w-7 text-primary" />
          ) : (
            <RotateCcw className="h-7 w-7 text-destructive" />
          )}
        </div>
        <h2 className="mt-4 font-display text-3xl font-semibold">{result.score}%</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.correct} acertos · {result.total - result.correct} erros
        </p>
        <p
          className={`mt-3 text-sm font-medium ${
            result.passed ? "text-primary" : "text-destructive"
          }`}
        >
          {result.passed
            ? "Aprovado! Você atingiu a nota mínima."
            : `Reprovado. Mínimo necessário: ${PASS_THRESHOLD}%.`}
        </p>
        {saving && (
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Salvando tentativa…
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold">Revisão das respostas</h3>
        {questions.map((q, i) => {
          const ans = answers[q.id];
          const ok = ans === q.correct_answer;
          return (
            <div
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start gap-3">
                {ok ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                )}
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Questão {i + 1}
                  </p>
                  <p className="mt-1 font-medium">{q.question}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sua resposta:{" "}
                    <span className={ok ? "text-primary" : "text-destructive"}>
                      {ans || "—"}
                    </span>
                  </p>
                  {!ok && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Resposta correta:{" "}
                      <span className="text-foreground">{q.correct_answer}</span>
                    </p>
                  )}
                  {q.explanation && (
                    <p className="mt-2 rounded-lg bg-background/50 p-3 text-sm text-muted-foreground">
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onRetry} className="rounded-full">
          <RotateCcw className="mr-2 h-4 w-4" /> Refazer quiz
        </Button>
        <Button onClick={onBack} variant="outline" className="rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao curso
        </Button>
      </div>
    </div>
  );
}
