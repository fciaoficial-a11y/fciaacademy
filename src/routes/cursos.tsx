import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock, Loader2, Search } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/Section";
import { coursesQuery, tracksQuery } from "@/lib/catalog-queries";
import { getIcon } from "@/lib/icon-map";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — FCIA Academy" },
      { name: "description", content: "Catálogo completo de cursos em IA, tecnologia, negócios e carreira." },
      { property: "og:title", content: "Catálogo de Cursos FCIA" },
      { property: "og:description", content: "Explore o catálogo da FCIA Academy." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(tracksQuery);
    context.queryClient.ensureQueryData(coursesQuery);
  },
  component: CursosPage,
  errorComponent: () => (
    <Section>
      <h1 className="font-display text-2xl">Não foi possível carregar o catálogo.</h1>
    </Section>
  ),
  notFoundComponent: () => null,
});

function CursosPage() {
  const tracksQ = useQuery(tracksQuery);
  const coursesQ = useQuery(coursesQuery);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const tracks = tracksQ.data ?? [];
  const courses = coursesQ.data ?? [];

  const levels = useMemo(
    () => Array.from(new Set(courses.map((c) => c.level))),
    [courses],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (trackFilter !== "all" && c.track_id !== trackFilter) return false;
      if (levelFilter !== "all" && c.level !== levelFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [courses, search, trackFilter, levelFilter]);

  const trackById = useMemo(
    () => new Map(tracks.map((t) => [t.id, t])),
    [tracks],
  );

  const loading = tracksQ.isLoading || coursesQ.isLoading;

  return (
    <>
      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="Catálogo"
          title="Todos os cursos da plataforma."
          description="Filtre por interesse, nível ou trilha. Conteúdo atualizado constantemente conforme o mercado evolui."
        />
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-background px-5 py-3 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cursos, temas ou ferramentas…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-3 text-sm outline-none"
          >
            <option value="all">Todas as trilhas</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-3 text-sm outline-none"
          >
            <option value="all">Todos os níveis</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </Section>

      <Section>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            Nenhum curso encontrado com esses filtros.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const track = trackById.get(c.track_id);
              const Icon = getIcon(track?.icon);
              return (
                <Link
                  key={c.id}
                  to="/curso/$slug"
                  params={{ slug: c.slug }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.4)]"
                >
                  <div className="relative h-28 overflow-hidden border-b border-border bg-surface">
                    <Icon className="absolute right-5 top-5 h-10 w-10 text-foreground/90 transition-transform group-hover:scale-110" />
                    <span className="absolute bottom-3 left-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {track?.tag ?? ""}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-base font-semibold tracking-tight">
                      {c.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {Math.round(c.duration_minutes / 60)}h · {c.level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-foreground">
                        Ver trilha <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
