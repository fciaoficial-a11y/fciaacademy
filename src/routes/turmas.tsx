import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Calendar, Clock, MapPin } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/Section";
import { cohorts } from "@/lib/catalog";

export const Route = createFileRoute("/turmas")({
  head: () => ({
    meta: [
      { title: "Turmas abertas — FCIA Academy" },
      { name: "description", content: "Próximas turmas ao vivo das trilhas FCIA. Vagas limitadas." },
      { property: "og:title", content: "Turmas FCIA Academy" },
      { property: "og:description", content: "Veja as próximas turmas e garanta sua vaga." },
    ],
  }),
  component: TurmasPage,
});

function TurmasPage() {
  return (
    <>
      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="Turmas ao vivo"
          title="Próximas turmas abertas."
          description="Cada turma tem mentoria síncrona, conteúdo prático e acompanhamento real. Vagas são limitadas para garantir qualidade."
        />
      </Section>

      <Section>
        <div className="space-y-4">
          {cohorts.map((c) => {
            const pct = Math.round((c.taken / c.seats) * 100);
            const left = c.seats - c.taken;
            return (
              <div
                key={c.id}
                className="group grid items-center gap-6 rounded-2xl border border-border bg-background p-6 transition-colors hover:bg-surface lg:grid-cols-[1.5fr_1fr_1fr_auto]"
              >
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Turma {c.id}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
                    {c.trackTitle}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {c.start}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {c.format}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Ocupação</span>
                    <span className="font-mono text-foreground">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Vagas restantes</div>
                  <div className="font-display text-2xl font-semibold">{left}</div>
                </div>

                <Link
                  to="/inscricao"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform group-hover:-translate-y-0.5"
                >
                  Inscrever-se
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
