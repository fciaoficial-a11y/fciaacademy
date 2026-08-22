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
import { Button } from "@/components/ui/button";
import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { FAQ } from "@/components/site/FAQ";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/home-hero-masterclass.jpeg.asset.json";
import courseImage from "@/assets/course-ai.webp.asset.json";
import professorImage from "@/assets/fernando-cabral.webp.asset.json";
import ebookMockup from "@/assets/ebook-ia-sem-complicacao/ebook-mockup.jpeg.asset.json";

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
      { property: "og:url", content: "https://fciaacademy.lovable.app/" },
      {
        property: "og:image",
        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",
      },
      { property: "og:image:width", content: "1920" },
      { property: "og:image:height", content: "1080" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",
      },
    ],
    links: [{ rel: "canonical", href: "https://fciaacademy.lovable.app/" }],
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

    // Ebook não compete visualmente com cursos/masterclass na vitrine principal
    const EBOOK_SLUG = "ia-sem-complicacao";
    const list = (courses ?? []).filter((c) => c.slug !== EBOOK_SLUG);

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
  children,
  className,
  ...link
}: LinkProps & { children: ReactNode; className?: string }) {
  return (
    <Link
      {...link}
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
  { n: "3", title: "Faça o quiz final" },
  { n: "4", title: "Gere seu certificado" },
];

function formatWorkload(course: FeaturedCourse) {
  if (course.workload_hours && course.workload_hours > 0) {
    return `${course.workload_hours}h de carga horária`;
  }
  if (course.duration_minutes && course.duration_minutes > 0) {
    const h = Math.floor(course.duration_minutes / 60);
    const m = course.duration_minutes % 60;
    if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ""} de conteúdo`;
    return `${m}min de conteúdo`;
  }
  return null;
}

function Index() {
  const { data: courses, isLoading } = useQuery(featuredCoursesQuery);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 text-center md:px-12">
        <div className="container relative z-10 mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-3 w-3" /> Masterclass "IA Criativa" — Inscrições Abertas
          </div>
          
          <h1 className="mb-8 text-5xl font-black leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            Onde a IA vira <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-300% animate-gradient">realidade prática.</span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            Cursos direto ao ponto para quem quer dominar as ferramentas de Inteligência Artificial e aplicá-las hoje no trabalho, nos negócios e na vida.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-700">
            <PrimaryCTA to="/curso/metodo-ia-criativa">Acessar Masterclass</PrimaryCTA>
            <SecondaryCTA to="/cursos">Ver Catálogo</SecondaryCTA>
          </div>
        </div>

        {/* Hero Background Grid */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-[0.03]" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </section>

      {/* Featured Courses Grid */}
      <section className="bg-card/50 py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Cursos em Destaque</h2>
              <p className="text-muted-foreground">Formações práticas focadas em resultados reais, do básico ao avançado.</p>
            </div>
            <Link to="/cursos" className="group flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80">
              Ver todos os cursos
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[16/10] animate-pulse rounded-3xl bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses?.map((course) => (
                <Link
                  key={course.id}
                  to="/curso/$slug"
                  params={{ slug: course.slug }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-background/50 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <SecureImage
                      src={course.cover_url || ""}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">
                        {course.price === 0 ? "Gratuito" : `R$ ${course.price?.toFixed(2)}`}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest">
                        <BookOpen className="h-3 w-3" />
                        {course.modules_count} Módulos
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="mb-6 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BadgeCheck className="h-4 w-4 text-emerald-500" />
                        Certificado
                      </div>
                      {formatWorkload(course) && (
                         <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            {formatWorkload(course)}
                         </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Para quem é a FCIA?</h2>
              <p className="mb-10 text-lg text-muted-foreground">
                Não importa seu nível técnico ou área de atuação. Se você quer usar a tecnologia a seu favor, aqui é o seu lugar.
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {audience.map((item) => (
                  <div key={item.title} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-6 transition-colors hover:bg-white/10">
                    <item.icon className="h-6 w-6 text-primary" />
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10">
               <SecureImage 
                 src={professorImage.url} 
                 alt="Fernando Cabral - FCIA" 
                 className="h-full w-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8 right-8">
                  <p className="mb-2 text-sm font-medium text-primary">Fundador & Instrutor</p>
                  <h4 className="text-2xl font-bold text-foreground">Fernando Cabral</h4>
                  <p className="text-sm text-muted-foreground">Especialista em implementação de IA e processos criativos digitais.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card/30 py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="mb-16 text-3xl font-bold text-foreground md:text-4xl text-center mx-auto max-w-xl">Jornada do Aluno</h2>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.2)]">
                  {step.n}
                </div>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                {step.n !== "4" && (
                   <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t border-dashed border-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">Dúvidas Comuns</h2>
          <FAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-24 px-6 md:px-12">
        <div className="container relative z-10 mx-auto max-w-4xl rounded-[40px] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-12 text-center backdrop-blur-xl md:p-20">
          <h2 className="mb-6 text-4xl font-black tracking-tight text-foreground md:text-6xl">Pronto para começar?</h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            Junte-se a centenas de alunos que já estão transformando sua produtividade com Inteligência Artificial.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PrimaryCTA to="/cursos">Ver catálogo completo</PrimaryCTA>
            <SecondaryCTA to="/register">Criar conta gratuita</SecondaryCTA>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-5" />
      </section>
    </div>
  );
}

// ---------------- Helpers ----------------
function SecureImage({ src, alt, className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={cn("flex items-center justify-center bg-white/5", className)}>
        <Sparkles className="h-8 w-8 text-white/10" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} {...rest} />;
}
