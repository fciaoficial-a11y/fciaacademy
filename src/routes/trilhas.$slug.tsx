import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen, Clock, GraduationCap, Layers, Users } from "lucide-react";
import { Section, Eyebrow } from "@/components/site/Section";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { trackBySlugQuery, tracksQuery } from "@/lib/catalog-queries";
import { getIcon } from "@/lib/icon-map";

export const Route = createFileRoute("/cursos/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(trackBySlugQuery(params.slug));
    if (!data) throw notFound();
    context.queryClient.ensureQueryData(tracksQuery);
  },
  head: () => ({
    meta: [
      { title: "Trilha — FCIA Academy" },
      { name: "description", content: "Detalhes da trilha e cursos." },
    ],
  }),
  notFoundComponent: () => (
    <Section>
      <h1 className="font-display text-4xl font-semibold">Trilha não encontrada</h1>
      <Link to="/cursos" className="mt-6 inline-flex items-center gap-1 text-sm text-foreground hover:gap-2">
        Voltar ao catálogo <ArrowUpRight className="h-4 w-4" />
      </Link>
    </Section>
  ),
  errorComponent: () => (
    <Section>
      <h1 className="font-display text-2xl">Algo deu errado ao carregar esta trilha.</h1>
    </Section>
  ),
  component: TrackDetail,
});

function TrackDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(trackBySlugQuery(slug));
  const allTracks = useQuery(tracksQuery);
  if (!data) return null;
  const { track, courses } = data;
  const Icon = getIcon(track.icon);
  const related = (allTracks.data ?? []).filter((t) => t.slug !== track.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-faint opacity-50" />
        <div className="absolute -top-32 right-[-10%] h-[400px] w-[400px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <Link to="/cursos" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            ← Catálogo
          </Link>
          <div className="mt-6 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <Eyebrow>{track.tag}</Eyebrow>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                {track.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{track.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/inscricao"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:-translate-y-0.5"
                >
                  Iniciar trilha <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/turmas"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-surface"
                >
                  Ver turmas abertas
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-7">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
                <Icon className="h-5 w-5" />
              </span>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <Meta icon={Clock} label="Carga" value={track.hours} />
                <Meta icon={Layers} label="Cursos" value={String(courses.length)} />
                <Meta icon={GraduationCap} label="Nível" value={track.level} />
                <Meta icon={Users} label="Formato" value="Online ao vivo" />
              </dl>
            </div>
          </div>
        </div>
      </section>

      <Section className="border-b border-border">
        <Eyebrow>Cursos desta trilha</Eyebrow>
        <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {courses.length} {courses.length === 1 ? "curso disponível" : "cursos disponíveis"}
        </h2>
        {courses.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Nenhum curso publicado ainda.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <article
                key={c.id}
                className="group flex flex-col rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.round(c.duration_minutes / 60)}h
                  </span>
                  <span>{c.level}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Trilhas relacionadas
          </h2>
          <Link to="/cursos" className="text-sm text-muted-foreground hover:text-foreground">
            Ver todas
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {related.map((t) => {
            const I = getIcon(t.icon);
            return (
              <Link
                key={t.slug}
                to="/cursos/$slug"
                params={{ slug: t.slug }}
                className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:bg-surface"
              >
                <I className="h-5 w-5 text-foreground" />
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
              </Link>
            );
          })}
        </div>
      </Section>

      <Testimonials />
      <FAQ />
    </>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 font-display text-base font-semibold">{value}</dd>
    </div>
  );
}

