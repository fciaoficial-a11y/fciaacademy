import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { FAQ } from "@/components/site/FAQ";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-ai.webp.asset.json";
import courseImage from "@/assets/course-ai.webp.asset.json";
import professorImage from "@/assets/fernando-cabral.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FCIA Academy — Aprenda IA de um jeito simples e prático" },
      {
        name: "description",
        content:
          "Conteúdos diretos para quem quer entender inteligência artificial e aplicar no trabalho, nos estudos ou no próprio negócio.",
      },
      { property: "og:title", content: "FCIA Academy — IA prática para a vida real" },
      {
        property: "og:description",
        content:
          "Cursos práticos de IA com certificado ao concluir. Comece pela FCIA Academy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// ---------------- Featured courses query ----------------
type FeaturedCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  workload_hours: number | null;
  duration_minutes: number | null;
  price: number | null;
  certificate_enabled: boolean | null;
  modules_count: number;
};

const featuredCoursesQuery = queryOptions({
  queryKey: ["home", "featured-courses"],
  queryFn: async (): Promise<FeaturedCourse[]> => {
    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, slug, title, description, cover_url, workload_hours, duration_minutes, price, certificate_enabled, sort_order")
      .eq("is_published", true)
      .order("price", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const list = courses ?? [];
    // Masterclass sempre em primeiro lugar na vitrine da home
    const MASTERCLASS_SLUG = "metodo-ia-criativa";
    list.sort((a, b) => {
      if (a.slug === MASTERCLASS_SLUG) return -1;
      if (b.slug === MASTERCLASS_SLUG) return 1;
      return 0;
    });
    return Promise.all(
      list.map(async (c) => {
        const { count } = await supabase
          .from("modules")
          .select("id", { count: "exact", head: true })
          .eq("course_id", c.id);
        return { ...(c as Omit<FeaturedCourse, "modules_count">), modules_count: count ?? 0 };
      }),
    );
  },
  staleTime: 60_000,
});

// ---------------- CTAs ----------------
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
  href,
  children,
  className,
}: {
  to?: LinkProps["to"];
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const classes = cn(
    ctaBase,
    "border border-white/15 bg-white/5 text-foreground backdrop-blur hover:bg-white/10",
    className,
  );
  if (href) return <a href={href} className={classes}>{children}</a>;
  return (
    <Link to={to!} className={classes}>
      {children}
    </Link>
  );
}

// ---------------- Audience ----------------
const audience: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Store, title: "Pequenos negócios", text: "Mais ideias e menos tempo perdido." },
  { icon: Sparkles, title: "Criadores", text: "Conteúdos que chamam atenção." },
  { icon: GraduationCap, title: "Estudantes", text: "Novas ferramentas para aprender melhor." },
  { icon: Lightbulb, title: "Curiosos", text: "Um caminho simples para começar." },
];

// ---------------- How it works ----------------
const steps: { n: string; title: string }[] = [
  { n: "1", title: "Escolha o curso" },
  { n: "2", title: "Estude os módulos" },
  { n: "3", title: "Faça o quiz" },
  { n: "4", title: "Conquiste seu certificado" },
];

// ---------------- FAQ ----------------
const faqItems = [
  {
    q: "Preciso entender de tecnologia para começar?",
    a: "Não. O curso foi feito para quem está começando. A linguagem é simples e cada módulo parte do zero.",
  },
  {
    q: "O curso é gratuito?",
    a: "Sim. O curso Fundamentos de IA para Profissionais é gratuito. Basta criar sua conta para acessar.",
  },
  {
    q: "Como funciona o certificado?",
    a: "Ao concluir os módulos e alcançar pelo menos 70% de aproveitamento no quiz, o certificado é emitido automaticamente com código de validação pública.",
  },
  {
    q: "Posso estudar pelo celular?",
    a: "Sim. Toda a plataforma é responsiva. Você acessa e estuda pelo celular, tablet ou computador, no seu ritmo.",
  },
];

function formatWorkload(course: FeaturedCourse): string {
  if (course.workload_hours && course.workload_hours > 0) return `${course.workload_hours}h de carga horária`;
  if (course.duration_minutes && course.duration_minutes > 0) {
    const h = Math.round(course.duration_minutes / 60);
    return `${h}h de carga horária`;
  }
  return "Carga horária flexível";
}

function priceLabel(price: number | null | undefined): string {
  if (price == null || Number(price) === 0) return "Gratuito";
  return `R$ ${Number(price).toFixed(2).replace(".", ",")}`;
}

function Index() {
  const featured = useQuery(featuredCoursesQuery);
  const courses = featured.data ?? [];
  const MASTERCLASS_SLUG = "metodo-ia-criativa";
  const hasMasterclass = courses.some((c) => c.slug === MASTERCLASS_SLUG);
  const primaryHref = hasMasterclass
    ? `/curso/${MASTERCLASS_SLUG}/oferta`
    : courses[0]
      ? `/curso/${courses[0].slug}/oferta`
      : "/cursos";

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-60" aria-hidden />
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/25 blur-[160px] animate-pulse-glow"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pb-24 lg:pt-28">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Nova Masterclass · Método IA Criativa
            </div>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Pare de perder horas em tarefas repetitivas.{" "}
              <span className="text-gradient">Domine IA</span> e entregue em minutos o que hoje leva o seu dia inteiro.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              Método direto para gestores, vendedores e profissionais liberais aplicarem IA em relatórios,
              propostas, atendimento e prospecção — mesmo sem background técnico. Em 30 dias você produz mais,
              com menos esforço, e se posiciona como referência no seu mercado.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur lg:justify-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Fernando Cabral</p>
                <p className="text-xs text-muted-foreground">
                  Especialista em IA aplicada a negócios · +15 anos formando profissionais no Brasil
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <PrimaryCTA to={primaryHref}>Conhecer a Masterclass</PrimaryCTA>
              <SecondaryCTA href="#curso-destaque">Ver todos os cursos</SecondaryCTA>
            </div>

          </div>

          <div className="relative order-last lg:order-none">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/25 via-transparent to-accent/25 blur-2xl" aria-hidden />
            <ImageWithFallback
              src={heroImage.url}
              alt="Profissional utilizando notebook e celular para aplicar inteligência artificial no trabalho"
              width={1280}
              height={960}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative aspect-[4/3] w-full rounded-[1.5rem] border border-white/10 object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>


      {/* ============ PARA QUEM É ============ */}
      <section className="border-t border-white/5 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              Para quem é
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              IA para a <span className="text-gradient">vida real</span>.
            </h2>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audience.map((a) => {
              const Icon = a.icon;
              return (
                <li
                  key={a.title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-primary/30 hover:bg-white/[0.05]"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{a.title}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{a.text}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ============ CURSO EM DESTAQUE ============ */}
      <section id="curso-destaque" className="border-t border-white/5 bg-surface/30 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Comece por aqui
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Seu primeiro passo em <span className="text-gradient">IA</span>.
            </h2>
          </div>

          <div className="mt-10">
            {featured.isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="h-[420px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
                <div className="h-[420px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {courses.map((c) => (
                  <FeaturedCourseCard key={c.id} course={c} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum curso disponível no momento. Novos conteúdos em breve.
                </p>
                <div className="mt-5 flex justify-center">
                  <SecondaryCTA to="/cursos">Ver catálogo</SecondaryCTA>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section className="border-t border-white/5 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              Como funciona
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Aprenda no <span className="text-gradient">seu ritmo</span>.
            </h2>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li
                key={s.n}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-mono text-sm font-bold text-primary-foreground">
                  {s.n}
                </div>
                <div className="mt-4 text-sm font-semibold text-foreground">{s.title}</div>
              </li>
            ))}
          </ol>

          <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
            Você avança no seu tempo e recebe certificado ao alcançar 70% de aproveitamento.
          </p>
        </div>
      </section>

      {/* ============ SOBRE O PROFESSOR ============ */}
      <section className="border-t border-white/5 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(220px,300px)_1fr] lg:items-center lg:gap-14">
            <div className="relative mx-auto w-full max-w-[280px] lg:mx-0">
              <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/30 via-transparent to-accent/30 blur-2xl" aria-hidden />
              <ImageWithFallback
                src={professorImage.url}
                alt="Retrato do Prof. Fernando Cabral, fundador da FCIA Academy"
                width={560}
                height={700}
                loading="lazy"
                decoding="async"
                className="relative aspect-[4/5] w-full rounded-2xl border border-white/10 object-cover shadow-xl"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                Sobre o Professor
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Tecnologia só faz sentido quando <span className="text-gradient">melhora a vida real</span>.
              </h2>
              <p className="mt-4 text-base font-semibold text-foreground">Prof. Fernando Cabral</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Professor, estrategista e fundador da FCIA. Fernando Cabral une inteligência artificial,
                criatividade e estratégia para ajudar pessoas e pequenos negócios a entenderem a tecnologia
                e aplicarem ferramentas atuais com clareza.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ============ FAQ ============ */}
      <FAQ
        items={faqItems}
        eyebrow="Dúvidas frequentes"
        title="Antes de começar."
      />
    </>
  );
}

function FeaturedCourseCard({ course }: { course: FeaturedCourse }) {
  const modulesLabel =
    course.modules_count > 0 ? `${course.modules_count} módulo${course.modules_count > 1 ? "s" : ""}` : null;
  const coverSrc = course.cover_url && course.cover_url.length > 0 ? course.cover_url : courseImage.url;
  const isMasterclass = course.slug === "metodo-ia-criativa";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card/70 backdrop-blur-xl transition-all hover:-translate-y-0.5",
        isMasterclass
          ? "border-primary/50 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.45)] hover:border-primary/70"
          : "border-white/10 hover:border-primary/40",
      )}
    >
      {isMasterclass ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          aria-hidden
        />
      ) : null}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <ImageWithFallback
          src={coverSrc}
          alt={`Capa do curso ${course.title}`}
          width={1200}
          height={750}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" aria-hidden />
        <span
          className={cn(
            "absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur",
            isMasterclass
              ? "border-primary/50 bg-primary/20 text-primary-foreground"
              : "border-white/20 bg-background/60 text-foreground",
          )}
        >
          {isMasterclass ? <Sparkles className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
          {isMasterclass ? "Masterclass · Destaque" : "Curso"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
          {course.title}
        </h3>

        {course.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        ) : null}

        <ul className="mt-5 flex flex-wrap gap-2 text-xs">
          <Chip>{formatWorkload(course)}</Chip>
          {modulesLabel ? <Chip>{modulesLabel}</Chip> : null}
          {course.certificate_enabled ? (
            <Chip>
              <Award className="h-3 w-3" /> Certificado
            </Chip>
          ) : null}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="font-display text-lg font-semibold text-accent">
            {priceLabel(course.price)}
          </span>
          <PrimaryCTA to={`/curso/${course.slug}/oferta`} className="h-11 px-6 text-sm">
            {isMasterclass ? "Ver Masterclass" : "Ver detalhes"}
          </PrimaryCTA>
        </div>
      </div>
    </article>
  );
}



function Chip({ children, highlight = false }: { children: ReactNode; highlight?: boolean }) {
  return (
    <li
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
        highlight
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-white/10 bg-white/[0.03] text-muted-foreground",
      )}
    >
      {children}
    </li>
  );
}

type ImageWithFallbackProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

function ImageWithFallback({ src, alt, className, ...rest }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/20 via-surface to-accent/20 text-xs text-muted-foreground",
          className,
        )}
      >
        <Sparkles className="h-6 w-6 opacity-60" aria-hidden />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} {...rest} />;
}

