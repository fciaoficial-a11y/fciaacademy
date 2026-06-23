import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Award,
  Brain,
  CheckCircle2,
  Flame,
  Play,
  Sparkles,
  Trophy,
  Zap,
  Bot,
  Workflow,
  FileText,
  Layers,
  Video,
  Briefcase,
  Building2,
  Coins,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { FAQ } from "@/components/site/FAQ";
import { tracks } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import fernandoCabralAsset from "@/assets/fernando-cabral.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FCIA Academy — IA, Automação e Tecnologia Aplicada" },
      {
        name: "description",
        content:
          "Aprenda IA, automação e tecnologia aplicada com trilhas práticas, certificações e projetos reais. Plataforma premium para acelerar sua evolução profissional.",
      },
      { property: "og:title", content: "FCIA Academy — Plataforma de IA e Tecnologia" },
      {
        property: "og:description",
        content:
          "Cursos práticos em IA, automação e novas tecnologias. Certificados, projetos reais e mentoria.",
      },
    ],
  }),
  component: Index,
});

// ---------------- Harmonized CTA system ----------------
const ctaBase =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold leading-none transition-all";

function PrimaryCTA({
  to,
  children,
  className,
}: {
  to: LinkProps["to"];
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        ctaBase,
        "group bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

function SecondaryCTA({
  to,
  children,
  className,
}: {
  to: LinkProps["to"];
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        ctaBase,
        "border border-white/15 bg-white/5 text-foreground backdrop-blur hover:bg-white/10",
        className,
      )}
    >
      {children}
    </Link>
  );
}

// ---------------- Data ----------------
const heroStats = [
  { value: "6", label: "Trilhas" },
  { value: "18", label: "Cursos" },
  { value: "72", label: "Módulos" },
  { value: "100%", label: "Certificados verificáveis" },
];

const socialProof = [
  { value: "6", label: "Trilhas de aprendizado", icon: Layers },
  { value: "18", label: "Cursos práticos", icon: Play },
  { value: "72", label: "Módulos aplicados", icon: Workflow },
  { value: "100%", label: "Certificados verificáveis", icon: Award },
];

const urgencyPoints = [
  { icon: Flame, text: "O mercado está mudando rapidamente" },
  { icon: Zap, text: "IA já transforma empresas e profissões" },
  { icon: Sparkles, text: "Quem aprende primeiro cria vantagem" },
];

// Benefit-oriented descriptions per track (home only)
const trackBenefits: Record<string, { desc: string; outcome: string }> = {
  "ia-aplicada": {
    desc: "Automatize tarefas repetitivas, aumente sua produtividade e economize horas de trabalho por semana com inteligência artificial.",
    outcome: "Você sai aplicando IA no seu dia a dia profissional.",
  },
  "dev-moderno": {
    desc: "Construa aplicações, APIs e produtos digitais reais com as tecnologias mais usadas pelo mercado hoje.",
    outcome: "Você sai capaz de entregar projetos completos.",
  },
  empreendedorismo: {
    desc: "Use IA e automação para criar produtos, serviços e novas fontes de receita escaláveis.",
    outcome: "Você sai com um modelo de negócio validado.",
  },
  "profissional-futuro": {
    desc: "Desenvolva as competências comportamentais e técnicas mais valorizadas pelas empresas dos próximos 10 anos.",
    outcome: "Você sai pronto para liderar a transformação.",
  },
  inovacao: {
    desc: "Aprenda a identificar oportunidades, aplicar novas tecnologias e criar vantagem competitiva real no seu setor.",
    outcome: "Você sai pensando como agente de inovação.",
  },
  "renda-freelance": {
    desc: "Transforme conhecimento em serviços, projetos freelance e novas oportunidades de renda recorrente.",
    outcome: "Você sai com um caminho prático para monetizar.",
  },
};

const capabilities: { icon: LucideIcon; label: string }[] = [
  { icon: Bot, label: "Criar agentes de IA" },
  { icon: Workflow, label: "Automatizar processos" },
  { icon: FileText, label: "Produzir conteúdo em escala" },
  { icon: Layers, label: "Construir soluções SaaS" },
  { icon: Video, label: "Criar vídeos com IA" },
  { icon: Briefcase, label: "Estruturar negócios digitais" },
  { icon: Building2, label: "Aplicar automações empresariais" },
  { icon: Coins, label: "Gerar novas fontes de renda" },
];


const instructorMetrics = [
  { value: "15+", label: "Anos em tecnologia" },
  { value: "+50", label: "Produtos digitais" },
  { value: "+10k", label: "Alunos impactados" },
];

const instructorReasons = [
  "Especialista em IA aplicada",
  "Desenvolvimento SaaS",
  "Automação empresarial",
  "Branding estratégico",
  "Educação tecnológica",
  "Metodologia própria baseada em aplicação prática",
];

function useMobileCarouselAutoplay(cardSelector: string, intervalMs = 3000) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let paused = false;
    const onPause = () => { paused = true; };
    const onResume = () => { paused = false; };
    el.addEventListener("pointerdown", onPause);
    el.addEventListener("pointerup", onResume);
    el.addEventListener("mouseleave", onResume);

    const interval = window.setInterval(() => {
      if (paused) return;
      const card = el.querySelector<HTMLElement>(cardSelector);
      const step = card ? card.offsetWidth + 20 : 320;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + step >= maxScroll - 4 ? 0 : el.scrollLeft + step;
      el.scrollTo({ left: next, behavior: "smooth" });
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
      el.removeEventListener("pointerdown", onPause);
      el.removeEventListener("pointerup", onResume);
      el.removeEventListener("mouseleave", onResume);
    };
  }, [cardSelector, intervalMs]);
  return ref;
}

function Index() {
  const tracksScrollerRef = useMobileCarouselAutoplay("[data-track-card]");
  const demoScrollerRef = useMobileCarouselAutoplay("[data-demo-card]");



  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-60" aria-hidden />
        <div
          className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/25 blur-[160px] animate-pulse-glow"
          aria-hidden
        />
        <div
          className="absolute top-40 right-[-10%] h-[400px] w-[400px] rounded-full bg-accent/30 blur-[140px] animate-pulse-glow"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-10 sm:pt-16 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            {/* Copy */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Plataforma de IA · Tecnologia · Automação
              </div>

              <h1 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.75rem]">
                Domine <span className="text-gradient">IA</span> antes que ela transforme seu mercado.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/85 sm:text-xl">
                Aprenda a criar automações, agentes inteligentes, conteúdo e soluções digitais
                que geram <span className="text-foreground font-medium">resultados reais</span>.
              </p>

              {/* Urgency — hidden on mobile to reduce height */}
              <ul className="mt-5 hidden flex-col gap-2 sm:flex">
                {urgencyPoints.map((u) => {
                  const Icon = u.icon;
                  return (
                    <li
                      key={u.text}
                      className="inline-flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {u.text}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-10">
                <PrimaryCTA to="/inscricao" className="h-12 w-full px-7 text-sm sm:h-14 sm:w-auto sm:px-9 sm:text-base shadow-2xl shadow-primary/30">Começar gratuitamente</PrimaryCTA>
                <SecondaryCTA to="/trilhas" className="hidden sm:inline-flex">Explorar trilhas</SecondaryCTA>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:mt-10">
                {heroStats.map((s) => (
                  <div key={s.label} className="bg-background/40 p-3 backdrop-blur sm:p-4">
                    <div className="font-display text-xl font-semibold text-gradient sm:text-2xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium platform mockup — 30% larger, stronger contrast */}
            <div className="relative hidden animate-fade-up lg:block lg:scale-[0.97] lg:origin-left" style={{ animationDelay: "0.2s" }}>
              <div
                className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/45 via-accent/30 to-transparent blur-3xl"
                aria-hidden
              />
              <div className="relative rounded-[1.75rem] border border-white/15 bg-card/90 p-6 sm:p-7 backdrop-blur-xl glow-primary">
                {/* window chrome */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    fcia.academy/dashboard
                  </span>
                </div>

                {/* greeting + XP — bigger */}
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Bom dia, Ana</div>
                    <div className="mt-1 font-display text-xl font-semibold">
                      Nível 7 · Explorer
                    </div>
                  </div>
                  <div className="rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-sm font-bold text-primary ring-glow">
                    2.480 XP
                  </div>
                </div>

                {/* XP bar — thicker */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    <span>Progresso para nível 8</span>
                    <span className="text-primary">68%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_20px_rgba(120,140,255,0.6)]" />
                  </div>
                </div>

                {/* progress rows — more prominent */}
                <div className="mt-6 space-y-4">
                  <ProgressRow label="IA Aplicada · Módulo 4" value={72} />
                  <ProgressRow label="Automação com n8n" value={48} />
                  <ProgressRow label="Marketing com IA" value={91} />
                </div>

                {/* bottom widgets */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      <Award className="h-3 w-3 text-accent" /> Certificado
                    </div>
                    <div className="mt-1.5 text-sm font-semibold">Prompt Eng. Pro</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      <Trophy className="h-3 w-3 text-primary" /> Ranking
                    </div>
                    <div className="mt-1.5 text-sm font-semibold">#23 · Top 5%</div>
                  </div>
                </div>
              </div>

              {/* floating badge */}
              <div className="absolute -bottom-6 -left-6 hidden animate-float-slow rounded-2xl border border-white/10 bg-card/90 p-4 backdrop-blur-xl ring-glow sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Flame className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Streak
                    </div>
                    <div className="text-sm font-semibold">14 dias seguidos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF ============ */}
      <section className="relative border-y border-white/5 bg-surface/30 py-8 backdrop-blur sm:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {socialProof.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/[0.05] sm:rounded-2xl sm:p-5"
                >
                  <Icon className="h-4 w-4 text-primary transition-colors group-hover:text-accent sm:h-5 sm:w-5" />
                  <div className="mt-2 font-display text-xl font-semibold text-gradient sm:mt-3 sm:text-3xl">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TRILHAS ============ */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-28">
        <div className="absolute inset-0 tech-grid opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                Trilhas
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:mt-5 sm:text-5xl">
                Aprenda o que <span className="text-gradient">move o mercado</span>
              </h2>
              <p className="mt-2 text-base text-muted-foreground sm:mt-4 sm:text-lg">
                Trilhas práticas com foco em resultado — automação, IA aplicada, renda e novos negócios.
              </p>
            </div>
            <SecondaryCTA to="/trilhas" className="hidden h-11 px-5 text-sm sm:inline-flex">
              Ver todas <ArrowUpRight className="h-4 w-4" />
            </SecondaryCTA>
          </div>

          <div ref={tracksScrollerRef} className="mt-6 -mx-6 overflow-x-auto px-6 pb-4 sm:mt-12 lg:mx-0 lg:overflow-visible lg:px-0">
            <div className="flex gap-5 lg:grid lg:grid-cols-3 lg:gap-6">
              {tracks.map((t) => {
                const Icon = t.icon;
                const benefit = trackBenefits[t.slug];
                const desc = benefit?.desc ?? t.desc;
                const outcome = benefit?.outcome;
                return (
                  <Link
                    key={t.slug}
                    to="/cursos/$slug"
                    params={{ slug: t.slug }}
                    data-track-card
                    className="group relative w-[320px] shrink-0 lg:w-auto"
                  >
                    <div
                      className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/40 via-accent/30 to-transparent opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                    <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary ring-1 ring-primary/30 transition-all group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {t.tag}
                        </span>
                      </div>
                      <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">
                        {t.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {desc}
                      </p>
                      {outcome && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-xs font-medium leading-relaxed text-foreground/90">
                            {outcome}
                          </span>
                        </div>
                      )}
                      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-xs text-muted-foreground">
                        <span>{t.modules} cursos</span>
                        <span className="font-semibold text-primary">{t.hours}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CAPABILITIES — O que você será capaz de fazer ============ */}
      <section className="relative overflow-hidden border-y border-white/5 bg-surface/30 py-12 sm:py-20 lg:py-28">
        <div
          className="absolute left-1/3 top-0 h-[400px] w-[600px] rounded-full bg-primary/10 blur-[140px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Prova de transformação
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:mt-5 sm:text-5xl lg:text-[3.5rem]">
              Resultados que você <span className="text-gradient">vai alcançar</span>
            </h2>
            <p className="mt-2 text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Aplicações reais que você desenvolve ao longo das trilhas — não teoria, entrega.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-4">
            {capabilities.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-4 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-card/90 sm:p-6"
                >
                  <div
                    className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-2xl transition-all group-hover:bg-primary/30"
                    aria-hidden
                  />
                  <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-1 ring-primary/40 shadow-lg shadow-primary/20 sm:h-14 sm:w-14 sm:rounded-2xl">
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                  </span>
                  <div className="relative mt-3 font-display text-sm font-semibold leading-snug text-foreground sm:mt-5 sm:text-lg">
                    {c.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ DEMO — Platform showcase ============ */}
      <section className="relative overflow-hidden border-b border-white/5 bg-surface/40 py-12 sm:py-20 lg:py-28">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Plataforma
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:mt-5 sm:text-5xl">
              Veja a FCIA Academy <span className="text-gradient">em ação</span>
            </h2>
            <p className="mt-2 text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Dashboard, player, XP, certificados e ranking — experiência completa para evoluir.
            </p>
          </div>

          <div ref={demoScrollerRef} className="mt-8 -mx-6 flex gap-4 overflow-x-auto px-6 pb-4 sm:mt-14 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0">
            <DemoCard
              icon={Play}
              tag="Player"
              title="Aulas que carregam em segundos"
              desc="Player otimizado, capítulos, transcrição automática e notas inline."
            />
            <DemoCard
              icon={Award}
              tag="Certificados"
              title="Certificação verificável"
              desc="Cada trilha gera certificado com QR e link público para LinkedIn."
            />
            <DemoCard
              icon={Trophy}
              tag="Ranking"
              title="Liga semanal"
              desc="Compita por XP, mantenha streak e suba no ranking ao vivo."
            />
          </div>
        </div>
      </section>


      {/* ============ INSTRUCTOR ============ */}
      <section className="relative overflow-hidden border-y border-white/5 bg-surface/30 py-12 sm:py-24 lg:py-32">
        <div
          className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent/15 blur-[140px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:gap-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
              {/* Visual portrait card — compact on mobile */}
              <div className="relative order-2 lg:order-1">
                <div
                  className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-primary/35 via-accent/25 to-transparent blur-3xl"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-primary/25 via-card/85 to-accent/25 p-5 backdrop-blur-xl sm:p-8 lg:aspect-[4/5]">
                  <div className="flex h-full flex-col items-center gap-4 text-center sm:gap-6 lg:justify-between lg:text-left">
                    <div className="hidden items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground lg:flex">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Fundador · CEO
                    </div>
                    <div className="relative h-32 w-32 overflow-hidden rounded-full ring-glow ring-2 ring-primary/40 sm:h-40 sm:w-40 lg:h-60 lg:w-60 lg:self-center">
                      <img
                        src={fernandoCabralAsset.url}
                        alt="Fernando Cabral, fundador e CEO da FCIA Academy"
                        className="h-full w-full object-cover object-[50%_20%] scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <div className="font-display text-base font-semibold leading-snug sm:text-xl lg:text-2xl">
                        "Tecnologia muda a vida de quem aprende a aplicar."
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground sm:text-sm">— Fernando Cabral</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                  Por que aprender comigo?
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:mt-5 sm:text-5xl">
                  Fernando Cabral
                </h2>
                <p className="mt-1 text-base text-gradient font-medium sm:mt-2 sm:text-lg">
                  Especialista em IA, SaaS e Educação Tecnológica
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
                  Mais de uma década construindo produtos digitais, automações e estratégias com IA.
                  Mentor de centenas de profissionais e fundador da FCIA Academy.
                </p>
              </div>
            </div>

            {/* Reasons + metrics — full width abaixo */}
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:p-6">
                <div className="font-display text-sm font-semibold sm:text-base">
                  Autoridades em
                </div>
                <ul className="mt-3 grid gap-2 sm:mt-4 sm:gap-2.5 sm:grid-cols-2">
                  {instructorReasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {instructorMetrics.map((m) => (
                  <div key={m.label} className="bg-background/50 p-3 sm:p-5">
                    <div className="font-display text-xl font-semibold text-gradient sm:text-2xl">
                      {m.value}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground sm:mt-1 sm:text-[11px]">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <FAQ />

      {/* ============ FINAL CTA ============ */}
      <section className="relative overflow-hidden py-14 sm:py-24 lg:py-32">
        <div className="absolute inset-0 tech-grid opacity-40" aria-hidden />
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[160px] animate-pulse-glow"
          aria-hidden
        />
        <div
          className="absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-accent/30 blur-[120px] animate-pulse-glow"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            <Brain className="h-3 w-3" />
            O futuro chegou — escolha seu lado
          </div>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:mt-6 sm:text-6xl lg:text-7xl">
            O mercado está mudando.
            <br />
            <span className="text-gradient">Você vai acompanhar ou liderar?</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">
            Comece gratuitamente e desenvolva habilidades que já estão transformando empresas,
            profissionais e negócios.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
            <PrimaryCTA to="/inscricao" className="h-12 w-full sm:h-12 sm:w-auto">Começar gratuitamente</PrimaryCTA>
            <SecondaryCTA to="/trilhas" className="hidden sm:inline-flex">Explorar trilhas</SecondaryCTA>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Sem cartão de crédito
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Acesso imediato
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Cancele quando quiser
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground/90">{label}</span>
        <span className="font-mono text-primary">{value}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_16px_rgba(120,140,255,0.45)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function DemoCard({
  icon: Icon,
  tag,
  title,
  desc,
}: {
  icon: LucideIcon;
  tag: string;
  title: string;
  desc: string;
}) {
  return (
    <div data-demo-card className="group relative w-[280px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/40 lg:w-auto lg:shrink">
      <div
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl transition-all group-hover:bg-primary/30"
        aria-hidden
      />
      <div className="relative flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {tag}
      </div>
      <h3 className="relative mt-5 font-display text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="relative mt-6 h-24 rounded-xl border border-white/10 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
    </div>
  );
}
