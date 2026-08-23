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
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { FAQ } from "@/components/site/FAQ";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/home-hero-masterclass.jpeg.asset.json";
import professorImage from "@/assets/fernando-cabral.webp.asset.json";
import ebookMockup from "@/assets/ebook-ia-sem-complicacao/ebook-mockup.jpeg.asset.json";
import masterclassCover from "@/assets/course-ai.webp.asset.json";

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

    const list = courses ?? [];
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
const steps: { n: string; title: string; desc: string }[] = [
  { n: "1", title: "Escolha o curso", desc: "Selecione o tema ideal para você." },
  { n: "2", title: "Estude os módulos", desc: "Aprenda no seu tempo, onde quiser." },
  { n: "3", title: "Faça o quiz", desc: "Valide seu conhecimento no final." },
  { n: "4", title: "Conquiste seu certificado", desc: "Gere seu certificado após aprovação." },
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

  const masterclass = courses?.find(c => c.slug === "metodo-ia-criativa");
  const vendaComIA = courses?.find(c => c.slug === "venda-com-ia");
  const ebook = courses?.find(c => c.slug === "ia-sem-complicacao");

  return (
    <div className="flex flex-col bg-background text-foreground selection:bg-primary/30">
      {/* 1. Hero em duas colunas */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col animate-in fade-in slide-in-from-left-8 duration-700">
             <div className="mb-6 flex items-center gap-2 text-xs font-bold tracking-widest text-primary uppercase">
                <span className="h-[1px] w-6 bg-primary" /> NOVA MASTERCLASS: MÉTODO IA CRIATIVA
             </div>
             {/* 2. Título à esquerda */}
             <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                Use <span className="text-primary italic">IA</span> para fazer em minutos o que hoje leva horas.
             </h1>
             {/* 3. Texto de apoio */}
             <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Aprenda a usar IA em relatórios, propostas, atendimento e prospecção — mesmo começando do zero.
             </p>

             {/* 4. Bloco de identificação */}
             <div className="mb-10 flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm max-w-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                   <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                   <p className="font-bold text-sm">Fernando Cabral</p>
                   <p className="text-xs text-muted-foreground">Especialista em IA aplicada a negócios • +15 anos formando profissionais no Brasil</p>
                </div>
             </div>

             {/* 5. Botões */}
             <div className="flex flex-wrap gap-4">
                <PrimaryCTA to="/curso/$slug/oferta" params={{ slug: "metodo-ia-criativa" }}>
                   Conhecer a Masterclass
                </PrimaryCTA>
                <SecondaryCTA to="/cursos">
                   Ver todos os cursos
                </SecondaryCTA>
             </div>
          </div>

          {/* 6. Card visual da Masterclass à direita com foto de Fernando */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
             <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-surface/50 group">
                <SecureImage 
                  src={heroImage.url} 
                  alt="A masterclass que eleva seu nível criativo" 
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                   <h3 className="text-2xl font-bold mb-2">A masterclass que eleva seu nível criativo.</h3>
                   <p className="text-sm text-white/70">FCIA Academy — Domine a Inteligência Artificial Criativa.</p>
                </div>
             </div>
             
             {/* Abstract light effects */}
             <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
             <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-[100px]" />
          </div>
        </div>

        {/* 7. Fundo escuro com grid sutil e iluminação azul/roxa */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* 8. Seção: IA para a vida real */}
      <section className="py-24 px-6 border-y border-white/5 bg-card/20">
         <div className="container mx-auto">
            <div className="mb-12">
               <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">PARA QUEM É</span>
               <h2 className="text-3xl md:text-5xl font-black mt-4">IA para a <span className="text-primary">vida real.</span></h2>
            </div>
            
            {/* 9. Quatro cards horizontais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {audience.map((item) => (
                  <div key={item.title} className="p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                     <item.icon className="h-8 w-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
                     <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                     <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 10. Seção: Seu primeiro passo em IA */}
      <section className="py-24 px-6">
         <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
               <div>
                  <span className="text-xs font-bold tracking-widest text-primary uppercase">COMECE POR AQUI</span>
                  <h2 className="text-3xl md:text-5xl font-black mt-4 italic">Seu primeiro passo em IA.</h2>
               </div>
               <Link to="/cursos" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  Ver catálogo completo <ArrowUpRight className="h-4 w-4" />
               </Link>
            </div>

            {/* 11. Card principal da Masterclass em layout horizontal */}
            {masterclass && (
               <div className="group relative mb-8 rounded-[2.5rem] border border-white/10 bg-white/5 overflow-hidden p-2">
                  <div className="grid lg:grid-cols-2 gap-4">
                     <div className="relative aspect-[16/9] lg:aspect-auto overflow-hidden rounded-[2rem]">
                        <SecureImage 
                          src={masterclass.cover_url || ""} 
                          alt={masterclass.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8">
                           <div className="max-w-[200px]">
                              <p className="text-xs font-bold tracking-[0.2em] text-white/60 mb-2 uppercase">MASTERCLASS ESTREIA</p>
                              <p className="text-3xl font-black text-white italic">Método IA Criativa</p>
                           </div>
                        </div>
                     </div>
                     <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-6">
                           <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">CURSO PRINCIPAL • 13 AULAS</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-4">{masterclass.title}</h3>
                        <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-md">
                           {masterclass.description || "Masterclass FCIA de criação com IA em nível profissional: imagem, vídeo, música e roteiro num só método aplicado."}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mb-8">
                           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/5 px-3 py-1.5 rounded-full">
                              <BookOpen className="h-3 w-3" /> {masterclass.modules_count} módulos
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/5 px-3 py-1.5 rounded-full">
                              <BadgeCheck className="h-3 w-3" /> Certificado
                           </div>
                        </div>

                        <div className="flex items-center justify-between gap-6 pt-6 border-t border-white/5">
                           <div>
                              <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase mb-1">ACESSO VITALÍCIO</p>
                              <p className="text-2xl font-black text-primary">R$ {masterclass.price?.toFixed(2)}</p>
                           </div>
                           <PrimaryCTA to="/curso/$slug/oferta" params={{ slug: masterclass.slug }}>
                              Ver Masterclass
                           </PrimaryCTA>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
               {/* 12. Card complementar “Venda com IA” */}
               {vendaComIA && (
                  <div className="group rounded-[2.5rem] border border-white/10 bg-white/5 overflow-hidden flex flex-col">
                     <div className="aspect-[16/9] overflow-hidden relative">
                        <SecureImage 
                           src={vendaComIA.cover_url || ""} 
                           alt={vendaComIA.title} 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 flex flex-col justify-end p-8">
                           <h3 className="text-2xl font-bold">{vendaComIA.title}</h3>
                        </div>
                     </div>
                     <div className="p-8 flex flex-col flex-1">
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                           IA aplicada a vendas, prospecção, objeções, follow-up e fechamento com prompts prontos.
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                           <div>
                              <p className="text-xl font-bold">R$ {vendaComIA.price?.toFixed(2)}</p>
                           </div>
                           <SecondaryCTA to="/curso/$slug/oferta" params={{ slug: vendaComIA.slug }} className="h-10 px-5">
                              Ver detalhes
                           </SecondaryCTA>
                        </div>
                     </div>
                  </div>
               )}

               {/* 13. Card do ebook “IA Sem Complicação” */}
               {ebook && (
                  <div className="group rounded-[2.5rem] border border-white/10 bg-white/5 overflow-hidden p-8 flex items-center gap-8">
                     <div className="h-40 w-28 shrink-0 relative shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-3">
                        <SecureImage 
                          src={ebookMockup.url} 
                          alt="IA Sem Complicação" 
                          className="w-full h-full object-cover rounded-md"
                        />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> EBOOK OFICIAL
                           </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{ebook.title}</h3>
                        <p className="text-xs text-muted-foreground mb-6 line-clamp-2">
                           Guia prático + bônus de 50 tarefas prontas para vender usando IA.
                        </p>
                        <div className="flex items-center justify-between">
                           <p className="text-lg font-bold">R$ {ebook.price?.toFixed(2)}</p>
                           <Link to="/ebook-ia-sem-complicacao" className="text-xs font-bold text-primary hover:underline underline-offset-4">Conhecer →</Link>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* 14. Seção: Aprenda no seu ritmo */}
      <section className="py-24 px-6 bg-surface/30">
         <div className="container mx-auto">
            <div className="mb-16 text-center lg:text-left">
               <span className="text-[10px] font-bold tracking-widest text-primary uppercase">COMO FUNCIONA</span>
               <h2 className="text-3xl md:text-5xl font-black mt-4 italic">Aprenda no <span className="text-primary">seu ritmo.</span></h2>
            </div>
            
            {/* 15. Quatro etapas de aprendizagem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {steps.map((step) => (
                  <div key={step.n} className="flex flex-col">
                     <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-xl font-black text-primary-foreground mb-6 shadow-lg shadow-primary/20">
                        {step.n}
                     </div>
                     <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                     <p className="text-sm text-muted-foreground">{step.desc}</p>
                     {step.n === "4" && (
                        <span className="text-[10px] font-bold tracking-widest text-emerald-500 mt-2 uppercase flex items-center gap-1">
                           <BadgeCheck className="h-3 w-3" /> +70% APROVAÇÃO
                        </span>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 16. Seção de apresentação do professor com foto de Fernando à esquerda */}
      <section className="py-24 px-6">
         <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
               <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                  <SecureImage 
                     src={professorImage.url} 
                     alt="Prof. Fernando Cabral" 
                     className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               </div>
               <div>
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase">SOBRE O PROFESSOR</span>
                  {/* 17. Frase: Tecnologia só faz sentido... */}
                  <h2 className="text-3xl md:text-5xl font-black mt-6 mb-8 italic">
                     “Tecnologia só faz sentido quando <span className="text-primary">melhora a vida real.</span>”
                  </h2>
                  
                  <div className="space-y-6">
                     <div>
                        <p className="font-bold text-lg">Prof. Fernando Cabral</p>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">FUNDADOR • FCIA ACADEMY</p>
                     </div>
                     <p className="text-muted-foreground leading-relaxed">
                        Professor, estrategista e fundador da FCIA, Fernando Cabral une inteligência artificial, criatividade e estratégia para ajudar pessoas e pequenos negócios a entenderem a tecnologia e aplicarem ferramentas atuais com clareza.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 18. Seção de dúvidas frequentes */}
      <section className="py-24 px-6 border-t border-white/5">
         <div className="container mx-auto max-w-7xl">
            <div className="mb-12">
               <span className="text-[10px] font-bold tracking-widest text-primary uppercase">DÚVIDAS FREQUENTES</span>
               <h2 className="text-3xl md:text-5xl font-black mt-4 italic">Antes de começar.</h2>
            </div>
            <FAQ />
         </div>
      </section>

      {/* 19. Rodapé organizado (SiteFooter é importado e usado em __root.tsx) */}
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