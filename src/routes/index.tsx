import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Award,
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
          "Comece pelo curso Fundamentos de IA para Profissionais: gratuito, com certificado ao concluir.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// ---------------- Featured course query ----------------
type FeaturedCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  workload_hours: number | null;
  duration_minutes: number | null;
  price: number | null;
  certificate_enabled: boolean | null;
  modules_count: number;
};

const FEATURED_SLUG = "ia-fundamentos-profissionais";

const featuredCourseQuery = queryOptions({
  queryKey: ["home", "featured-course", FEATURED_SLUG],
  queryFn: async (): Promise<FeaturedCourse | null> => {
    const { data: course, error } = await supabase
      .from("courses")
      .select("id, slug, title, description, workload_hours, duration_minutes, price, certificate_enabled")
      .eq("slug", FEATURED_SLUG)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    if (!course) return null;
    const { count } = await supabase
      .from("modules")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course.id);
    return { ...(course as Omit<FeaturedCourse, "modules_count">), modules_count: count ?? 0 };
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
  const featured = useQuery(featuredCourseQuery);
  const course = featured.data;

  const primaryHref = course ? `/curso/${course.slug}` : "/cursos";

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
              Aprenda IA de um jeito simples e prático
            </div>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Use <span className="text-gradient">IA</span> para criar, estudar e fazer seu negócio crescer.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              Conteúdos diretos para quem quer entender inteligência artificial e aplicar no trabalho, nos
              estudos ou no próprio negócio.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <PrimaryCTA to={primaryHref}>Começar agora</PrimaryCTA>
              <SecondaryCTA href="#curso-destaque">Conhecer o curso</SecondaryCTA>
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
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Comece por aqui
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Seu primeiro passo em <span className="text-gradient">IA</span>.
            </h2>
          </div>

          <div className="mt-8">
            {featured.isLoading ? (
              <div className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
            ) : course ? (
              <FeaturedCourseCard course={course} />
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

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />

      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="relative lg:h-full">
          <ImageWithFallback
            src={courseImage.url}
            alt="Profissional aplicando IA no trabalho com notebook e caderno de anotações"
            width={1200}
            height={912}
            loading="lazy"
            decoding="async"
            className="h-56 w-full object-cover sm:h-64 lg:h-full lg:min-h-[320px]"
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            <BookOpen className="h-3 w-3" />
            Curso em destaque
          </div>

          <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {course.title}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Entenda o que é IA, aprenda a criar comandos melhores, descubra usos práticos e use a
            tecnologia com responsabilidade.
          </p>

          <ul className="mt-5 flex flex-wrap gap-2 text-xs">
            <Chip>{formatWorkload(course)}</Chip>
            {modulesLabel ? <Chip>{modulesLabel}</Chip> : null}
            {course.certificate_enabled ? (
              <Chip>
                <Award className="h-3 w-3" /> Certificado ao concluir
              </Chip>
            ) : null}
            <Chip highlight>{priceLabel(course.price)}</Chip>
          </ul>

          <div className="mt-6">
            <PrimaryCTA to={`/curso/${course.slug}`}>
              {Number(course.price ?? 0) === 0 ? "Acessar curso gratuito" : "Acessar curso"}
            </PrimaryCTA>
          </div>
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

