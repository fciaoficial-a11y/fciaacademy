import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Section, SectionHeading, Eyebrow } from "@/components/site/Section";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { tracksQuery } from "@/lib/catalog-queries";
import { getIcon } from "@/lib/icon-map";

export const Route = createFileRoute("/trilhas")({
  head: () => ({
    meta: [
      { title: "Trilhas — FCIA Academy" },
      { name: "description", content: "Trilhas de aprendizado em IA, tecnologia, negócios e carreira." },
      { property: "og:title", content: "Trilhas FCIA Academy" },
      { property: "og:description", content: "Trilhas de aprendizado modernas, orientadas a resultado." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(tracksQuery);
  },
  component: TrilhasPage,
  errorComponent: () => (
    <Section>
      <h1 className="font-display text-2xl">Não foi possível carregar as trilhas.</h1>
    </Section>
  ),
  notFoundComponent: () => null,
});

function TrilhasPage() {
  const { data: tracks = [], isLoading } = useQuery(tracksQuery);

  return (
    <>
      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="Trilhas FCIA"
          title="Escolha a trilha que te leva ao próximo passo."
          description="Cada trilha entrega uma transformação concreta: novas habilidades, um novo posicionamento ou um novo modelo de renda."
        />
      </Section>

      <Section className="border-b border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
            {tracks.map((t) => {
              const Icon = getIcon(t.icon);
              return (
                <Link
                  key={t.slug}
                  to="/cursos/$slug"
                  params={{ slug: t.slug }}
                  className="group relative flex flex-col bg-background p-8 transition-colors hover:bg-surface"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t.tag}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.description}</p>
                  <ul className="mt-5 space-y-1.5 text-sm text-foreground/80">
                    {t.outcomes.slice(0, 2).map((o) => (
                      <li key={o} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 rounded-full bg-primary" />
                        {o}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>{t.level} · {t.modules} módulos</span>
                    <span className="inline-flex items-center gap-1 text-foreground">
                      Ver trilha <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      <Section>
        <div className="rounded-3xl border border-border bg-foreground p-10 text-background sm:p-14">
          <Eyebrow>Indecisão? Comece pelo diagnóstico.</Eyebrow>
          <h3 className="mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Em 3 minutos, indicamos a trilha ideal para o seu momento.
          </h3>
          <Link
            to="/inscricao"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
          >
            Fazer diagnóstico
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Testimonials />
      <FAQ />
    </>
  );
}
