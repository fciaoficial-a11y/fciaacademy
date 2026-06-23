import { Quote, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/Section";

export type Testimonial = {
  name: string;
  role: string;
  company?: string;
  quote: string;
  initials: string;
};

const defaultTestimonials: Testimonial[] = [
  {
    name: "Mariana Costa",
    role: "Product Manager",
    company: "Nubank",
    quote: "Em 3 semanas implantei agentes de IA no meu time. O ROI da trilha veio antes do final do curso.",
    initials: "MC",
  },
  {
    name: "Rafael Lima",
    role: "Fundador",
    company: "Studio Korus",
    quote: "Saí do zero em desenvolvimento e lancei meu primeiro SaaS pago com a metodologia da FCIA.",
    initials: "RL",
  },
  {
    name: "Juliana Reis",
    role: "Head de RH",
    company: "Stone",
    quote: "Treinamos 240 pessoas com a plataforma corporativa. Conclusão média de 89% — o melhor número que já tivemos.",
    initials: "JR",
  },
  {
    name: "Pedro Almeida",
    role: "Freelancer",
    quote: "Estruturei 3 ofertas com IA e conquistei meus primeiros R$ 12k em contratos recorrentes.",
    initials: "PA",
  },
  {
    name: "Camila Vargas",
    role: "Engenheira de Dados",
    company: "Itaú",
    quote: "A trilha de IA aplicada acelerou minha promoção. Apliquei tudo no dia seguinte às aulas.",
    initials: "CV",
  },
  {
    name: "Diego Souza",
    role: "CTO",
    company: "Klint",
    quote: "Conteúdo atualizado, mentoria afiada e comunidade que troca de verdade. FCIA virou parte do nosso onboarding.",
    initials: "DS",
  },
];

export function Testimonials({
  items = defaultTestimonials,
  eyebrow = "Prova social",
  title = "Histórias reais de quem aplicou.",
  description = "Mais de 38 mil alunos e 220 empresas já transformaram aprendizado em resultado com a FCIA.",
}: {
  items?: Testimonial[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Section className="border-b border-border bg-surface">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />

      {/* Mobile: horizontal scroll. Desktop: grid */}
      <div className="mt-12 -mx-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="flex gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.name}
              className="flex w-[85vw] shrink-0 flex-col rounded-2xl border border-border bg-background p-6 sm:w-auto sm:shrink"
            >
              <div className="flex items-center justify-between">
                <Quote className="h-5 w-5 text-primary" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-foreground text-foreground" />
                  ))}
                </div>
              </div>
              <blockquote className="mt-5 text-sm leading-relaxed text-foreground sm:text-base">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{t.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {t.role}{t.company ? ` · ${t.company}` : ""}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
