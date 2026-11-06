import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/course/influencer-com-ia')({
  component: InfluencerCoursePage,
});

type ModuleRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_type: string | null;
  duration_minutes: number | null;
  video_url: string | null;
  pdf_path: string | null;
};

type QuestionRow = {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
};

type AttemptRow = { module_id: string; score: number; passed: boolean };

const FALLBACK_MODULES: ModuleRow[] = [
  {
    id: 'fallback-m1',
    slug: 'm1-dna-da-influenciadora',
    title: 'O DNA da Influenciadora',
    description: 'Posicionamento, arquetipo e promessa central da influenciadora virtual.',
    content_type: 'video',
    duration_minutes: 22,
    video_url: null,
    pdf_path: null,
  },
  {
    id: 'fallback-m2',
    slug: 'm2-rosto-e-estetica',
    title: 'O Rosto e a Estetica',
    description: 'Seed mestre, direcao de arte e consistencia visual do rosto.',
    content_type: 'video',
    duration_minutes: 26,
    video_url: null,
    pdf_path: null,
  },
  {
    id: 'fallback-m3',
    slug: 'm3-realismo-cinematografico',
    title: 'O Realismo Cinematografico',
    description: 'Luz, lente, pele e cenario para sair do visual plastico.',
    content_type: 'video',
    duration_minutes: 24,
    video_url: null,
    pdf_path: null,
  },
  {
    id: 'fallback-m4',
    slug: 'm4-movimento-fala-sincronia',
    title: 'Movimento, Fala e Sincronia Labial',
    description: 'Roteiro, voz, prosodia e lip-sync natural.',
    content_type: 'video',
    duration_minutes: 28,
    video_url: null,
    pdf_path: null,
  },
  {
    id: 'fallback-m5',
    slug: 'm5-escala-e-monetizacao',
    title: 'Escala e Monetizacao',
    description: 'Esteira de producao, testes de gancho e receita no TikTok Shop.',
    content_type: 'video',
    duration_minutes: 30,
    video_url: null,
    pdf_path: null,
  },
];

const CHECKLIST_ITEMS = [
  'Defini o arquetipo e a promessa central da influenciadora',
  'Gerei o seed mestre com quatro angulos do rosto',
  'Escrevi o roteiro com dor, cena, produto e acao',
  'Produzi o video com sincronia labial revisada',
  'Publiquei o primeiro teste e anotei as metricas',
];

function InfluencerCoursePage() {
  const queryClient = useQueryClient();
  const [paid, setPaid] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPaid(window.localStorage.getItem('fcia:influencer-paid') === '1');
  }, []);

  const meQuery = useQuery({
    queryKey: ['influencer-me'],
    staleTime: 60000,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });
  const userId = meQuery.data?.id;

  const courseQuery = useQuery({
    queryKey: ['influencer-course'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, slug, title, description, price, is_free')
        .eq('slug', 'influencer-com-ia')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });
  const course = courseQuery.data;
  const price = Number(course?.price ?? 297);

  const modulesQuery = useQuery({
    queryKey: ['influencer-modules', course?.id],
    enabled: Boolean(course?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('id, slug, title, description, content_type, duration_minutes, video_url, pdf_path, sort_order')
        .eq('course_id', course!.id)
        .order('sort_order')
        .limit(5);
      if (error) throw error;
      return (data ?? []) as ModuleRow[];
    },
  });

  const list: ModuleRow[] = useMemo(() => {
    const db = modulesQuery.data ?? [];
    if (db.length === 5) return db;
    return FALLBACK_MODULES.map((fallback, index) => ({ ...fallback, ...(db[index] ?? {}) }));
  }, [modulesQuery.data]);

  const safeIdx = Math.min(activeIdx, list.length - 1);
  const active = list[safeIdx];

  const attemptsQuery = useQuery({
    queryKey: ['influencer-attempts', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('module_id, score, passed')
        .eq('user_id', userId!);
      if (error) throw error;
      return (data ?? []) as AttemptRow[];
    },
  });

  const passedIds = useMemo(() => {
    const set = new Set<string>();
    (attemptsQuery.data ?? []).forEach((a) => {
      if (a.passed || Number(a.score) >= 70) set.add(a.module_id);
    });
    return set;
  }, [attemptsQuery.data]);

  function isUnlocked(index: number) {
    if (!paid) return false;
    if (index === 0) return true;
    const previous = list[index - 1];
    return Boolean(previous && passedIds.has(previous.id));
  }

  const activeUnlocked = isUnlocked(safeIdx);
  const completedCount = list.filter((m) => passedIds.has(m.id)).length;
  const percent = list.length ? Math.round((completedCount / list.length) * 100) : 0;

  const questionsQuery = useQuery({
    queryKey: ['influencer-questions', active?.id, activeUnlocked],
    enabled: Boolean(activeUnlocked && active?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, question, options, correct_answer, explanation, sort_order')
        .eq('module_id', active!.id)
        .eq('status', 'approved')
        .order('sort_order');
      if (error) throw error;
      type RawQuestion = {
        id: string;
        question: string;
        options: unknown;
        correct_answer: string;
        explanation: string | null;
      };
      return ((data ?? []) as RawQuestion[]).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
      })) as QuestionRow[];
    },
  });

  useEffect(() => {
    setAnswers({});
    setQuizResult(null);
  }, [active?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || !active) return;
    try {
      const raw = window.localStorage.getItem('fcia:checklist:' + active.slug);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
  }, [active?.slug]);

  function toggleCheck(index: number) {
    if (!active) return;
    setChecked((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('fcia:checklist:' + active.slug, JSON.stringify(next));
      }
      return next;
    });
  }

  async function submitQuiz() {
    const questions = questionsQuery.data ?? [];
    if (!questions.length || !active?.id) return;
    if (!userId) {
      toast.error('Entre na sua conta para registrar o quiz');
      return;
    }
    setSubmitting(true);
    try {
      const correct = questions.filter((q) => answers[q.id] === q.correct_answer).length;
      const score = Math.round((correct / questions.length) * 100);
      const passed = score >= 70;
      const { error } = await supabase.from('quiz_attempts').insert({
        user_id: userId,
        module_id: active.id,
        score,
        passed,
        correct_count: correct,
        total_questions: questions.length,
      });
      if (error) throw error;
      setQuizResult({ score, passed });
      await queryClient.invalidateQueries({ queryKey: ['influencer-attempts', userId] });
      if (passed) {
        toast.success('Aprovada com ' + score + '% — proximo modulo liberado');
      } else {
        toast.error('Nota ' + score + '% — precisa de 70% para liberar o proximo modulo');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nao foi possivel registrar o quiz');
    } finally {
      setSubmitting(false);
    }
  }

  async function approvePayment() {
    setProcessing(true);
    try {
      const payload = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_sim_' + Date.now(),
          status: 'RECEIVED',
          billingType: 'PIX',
          value: price,
          externalReference: 'influencer-com-ia',
        },
      };
      console.info('[asaas] webhook de sucesso simulado', payload);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('fcia:influencer-paid', '1');
      }
      setPaid(true);
      setCheckoutOpen(false);
      toast.success('Pagamento aprovado — acesso ao curso liberado');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className='relative min-h-screen bg-[#0A0F1C] text-slate-100'>
      <div
        aria-hidden
        className='pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute top-40 right-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[120px]'
      />

      <div className='relative mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr] lg:py-12'>
        <aside className='rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300'>FCIA Academy</p>
          <h1 className='mt-2 font-display text-lg font-semibold leading-snug text-white'>
            {course?.title ?? 'Influenciadora com IA'}
          </h1>

          <div className='mt-4 space-y-1.5'>
            <div className='flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-400'>
              <span>Progresso</span>
              <span className='font-semibold tabular-nums text-cyan-300'>{percent}%</span>
            </div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 transition-all'
                style={{ width: percent + '%' }}
              />
            </div>
            <p className='text-[11px] text-slate-400'>
              {completedCount} de {list.length} modulos concluidos
            </p>
          </div>

          <nav className='mt-5 space-y-1'>
            {list.map((mod, index) => {
              const open = isUnlocked(index);
              const current = index === safeIdx;
              return (
                <button
                  key={mod.slug}
                  type='button'
                  onClick={() => setActiveIdx(index)}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition',
                    current
                      ? 'border-cyan-400/40 bg-cyan-400/10'
                      : 'border-transparent hover:border-white/10 hover:bg-white/[0.06]',
                  )}
                >
                  <span className='mt-0.5 shrink-0'>
                    {!open ? (
                      <Lock className='h-3.5 w-3.5 text-slate-500' />
                    ) : passedIds.has(mod.id) ? (
                      <CheckCircle2 className='h-3.5 w-3.5 text-cyan-300' />
                    ) : (
                      <PlayCircle className='h-3.5 w-3.5 text-fuchsia-300' />
                    )}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                      Modulo {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 block truncate text-[13px]',
                        current ? 'font-semibold text-white' : 'text-slate-300',
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
              className='mt-5 w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90'
            >
              Liberar acesso
            </Button>
          )}
        </aside>

        <main className='min-w-0 space-y-6'>
          <header className='rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-7'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-cyan-300'>
                <Sparkles className='h-3 w-3' /> Modulo {String(safeIdx + 1).padStart(2, '0')} /{' '}
                {String(list.length).padStart(2, '0')}
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-slate-300'>
                <ShieldCheck className='h-3 w-3' /> {active?.duration_minutes ?? 30} min
              </span>
            </div>
            <h2 className='mt-4 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl'>
              {active?.title}
            </h2>
            {active?.description && (
              <p className='mt-3 max-w-[60ch] text-sm leading-relaxed text-slate-400'>
                {active.description}
              </p>
            )}
          </header>

          <section className='relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black/70'>
            {active?.video_url ? (
              <video
                key={active.video_url}
                src={active.video_url}
                controls
                playsInline
                className='h-full w-full'
              />
            ) : (
              <div className='flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center'>
                <PlayCircle className='h-12 w-12 text-cyan-300/70' />
                <p className='text-sm text-slate-300'>Video-aula de {active?.title}</p>
                <p className='max-w-md text-xs text-slate-500'>
                  O video e publicado pelo professor no painel de producao e aparece aqui automaticamente.
                </p>
              </div>
            )}
            {!activeUnlocked && (
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#070B14]/85 px-6 text-center backdrop-blur-sm'>
                <Lock className='h-8 w-8 text-fuchsia-300' />
                <p className='font-display text-lg font-semibold text-white'>Modulo bloqueado</p>
                <p className='max-w-sm text-xs text-slate-400'>
                  {!paid
                    ? 'Libere o acesso ao curso para comecar a estudar.'
                    : 'Conclua o quiz do modulo anterior com 70% ou mais para desbloquear.'}
                </p>
                {!paid && (
                  <Button
                    onClick={() => setCheckoutOpen(true)}
                    className='mt-1 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white'
                  >
                    Liberar acesso
                  </Button>
                )}
              </div>
            )}
          </section>

          <div className='grid gap-6 lg:grid-cols-2'>
            <section className='rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl'>
              <div className='flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400'>
                <FileText className='h-3.5 w-3.5 text-cyan-300' /> Material em PDF
              </div>
              <div className='mt-4 flex aspect-[4/5] max-h-[320px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-[#070B14]/60 text-center'>
                <FileText className='h-9 w-9 text-slate-600' />
                <p className='text-xs text-slate-400'>Apostila do modulo</p>
                <p className='max-w-[22ch] text-[11px] text-slate-600'>
                  Visualizador de PDF do modulo {String(safeIdx + 1).padStart(2, '0')}
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2 rounded-full border-white/20 bg-transparent text-slate-200 hover:bg-white/10'
                >
                  Abrir PDF
                </Button>
              </div>
            </section>

            <section className='rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl'>
              <div className='flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400'>
                <ClipboardCheck className='h-3.5 w-3.5 text-fuchsia-300' /> Checklist de pratica
              </div>
              <ul className='mt-4 space-y-2'>
                {CHECKLIST_ITEMS.map((item, index) => (
                  <li key={item}>
                    <button
                      type='button'
                      onClick={() => toggleCheck(index)}
                      className='flex w-full items-start gap-2.5 rounded-xl border border-white/5 px-3 py-2 text-left transition hover:border-white/15 hover:bg-white/[0.05]'
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                          checked[index] ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20',
                        )}
                      >
                        {checked[index] ? <CheckCircle2 className='h-3 w-3 text-cyan-300' /> : null}
                      </span>
                      <span
                        className={cn(
                          'text-[12.5px] leading-snug',
                          checked[index] ? 'text-slate-500 line-through' : 'text-slate-300',
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

          <section className='rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-7'>
            <div className='flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400'>
              <Sparkles className='h-3.5 w-3.5 text-violet-300' /> Quiz do modulo
            </div>

            {!activeUnlocked ? (
              <p className='mt-4 text-sm text-slate-400'>
                O quiz deste modulo fica disponivel quando o modulo for liberado.
              </p>
            ) : questionsQuery.isLoading ? (
              <div className='mt-6 flex items-center gap-2 text-sm text-slate-400'>
                <Loader2 className='h-4 w-4 animate-spin' /> Carregando questoes...
              </div>
            ) : (questionsQuery.data ?? []).length === 0 ? (
              <p className='mt-4 text-sm text-slate-400'>
                As questoes deste modulo ainda nao foram publicadas.
              </p>
            ) : (
              <div className='mt-5 space-y-5'>
                {(questionsQuery.data ?? []).map((q, qIndex) => (
                  <div key={q.id} className='rounded-2xl border border-white/10 bg-[#070B14]/50 p-4'>
                    <p className='text-sm font-medium text-white'>
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className='mt-3 space-y-1.5'>
                      {q.options.map((option) => {
                        const selected = answers[q.id] === option;
                        return (
                          <button
                            key={option}
                            type='button'
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                            className={cn(
                              'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[13px] transition',
                              selected
                                ? 'border-cyan-400/50 bg-cyan-400/10 text-white'
                                : 'border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.05]',
                            )}
                          >
                            <span
                              className={cn(
                                'h-2.5 w-2.5 shrink-0 rounded-full border',
                                selected ? 'border-cyan-300 bg-cyan-300' : 'border-white/30',
                              )}
                            />
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {quizResult && (
                      <p className='mt-2 text-[11px] text-slate-500'>
                        Resposta correta: <span className='text-cyan-300'>{q.correct_answer}</span>
                        {q.explanation ? ' — ' + q.explanation : ''}
                      </p>
                    )}
                  </div>
                ))}

                <div className='flex flex-wrap items-center gap-3'>
                  <Button
                    onClick={submitQuiz}
                    disabled={
                      submitting ||
                      Object.keys(answers).length < (questionsQuery.data ?? []).length
                    }
                    className='rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90'
                  >
                    {submitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                    Enviar respostas
                  </Button>
                  {quizResult && (
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        quizResult.passed ? 'text-cyan-300' : 'text-fuchsia-300',
                      )}
                    >
                      Nota: {quizResult.score}%{' '}
                      {quizResult.passed ? '· aprovada' : '· minimo 70%'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {checkoutOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
          <div className='relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0A0F1C] p-6 shadow-2xl'>
            <button
              type='button'
              onClick={() => setCheckoutOpen(false)}
              aria-label='Fechar checkout'
              className='absolute right-4 top-4 text-slate-500 transition hover:text-white'
            >
              <X className='h-4 w-4' />
            </button>
            <p className='text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300'>
              Checkout Asaas
            </p>
            <h3 className='mt-2 font-display text-xl font-semibold text-white'>
              {course?.title ?? 'Influenciadora com IA'}
            </h3>
            <p className='mt-1 text-xs text-slate-400'>
              Pagamento unico via PIX · acesso imediato e vitalicio
            </p>

            <div className='mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
              <div className='flex items-center justify-between text-xs text-slate-400'>
                <span>Curso completo · 5 modulos</span>
                <span className='font-mono text-white'>R$ {price.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className='mt-2 flex items-center justify-between text-xs text-slate-400'>
                <span>Taxa</span>
                <span className='font-mono text-white'>R$ 0,00</span>
              </div>
              <div className='mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm'>
                <span className='font-semibold text-white'>Total</span>
                <span className='font-display text-lg font-semibold text-cyan-300'>
                  R$ {price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <Button
              onClick={approvePayment}
              disabled={processing}
              className='mt-5 w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90'
            >
              {processing ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <ShieldCheck className='mr-2 h-4 w-4' />
              )}
              {processing ? 'Confirmando PIX...' : 'Pagar com PIX'}
            </Button>
            <p className='mt-3 text-center text-[10.5px] leading-relaxed text-slate-500'>
              Simulacao do webhook PAYMENT_RECEIVED do Asaas. Ao aprovar, o acesso e liberado na
              hora.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
