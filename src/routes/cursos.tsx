import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/Section";
import { coursesQuery, tracksQuery } from "@/lib/catalog-queries";
import { getIcon } from "@/lib/icon-map";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type CatalogSearch = {
  q: string;
  track: string;
  level: string;
  workload: string;
  price: string;
};

const WORKLOAD_BUCKETS: Record<string, { label: string; test: (h: number) => boolean }> = {
  all: { label: "Qualquer carga", test: () => true },
  short: { label: "Até 2h", test: (h) => h > 0 && h <= 2 },
  medium: { label: "2h a 10h", test: (h) => h > 2 && h <= 10 },
  long: { label: "10h a 30h", test: (h) => h > 10 && h <= 30 },
  xlong: { label: "30h ou mais", test: (h) => h > 30 },
};

const PRICE_OPTIONS: Record<string, { label: string; test: (isFree: boolean, price: number) => boolean }> = {
  all: { label: "Todos os preços", test: () => true },
  free: { label: "Gratuitos", test: (f) => f },
  paid: { label: "Pagos", test: (f) => !f },
};

const DEFAULTS: CatalogSearch = { q: "", track: "all", level: "all", workload: "all", price: "all" };

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — FCIA Academy" },
      { name: "description", content: "Catálogo completo de cursos em IA, tecnologia, negócios e carreira." },
      { property: "og:title", content: "Catálogo de Cursos FCIA" },
      { property: "og:description", content: "Explore o catálogo da FCIA Academy." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: asString(search.q, DEFAULTS.q),
    track: asString(search.track, DEFAULTS.track),
    level: asString(search.level, DEFAULTS.level),
    workload: asString(search.workload, DEFAULTS.workload),
    price: asString(search.price, DEFAULTS.price),
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
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/cursos" });
  const [mobileOpen, setMobileOpen] = useState(false);

  const tracks = tracksQ.data ?? [];
  const courses = coursesQ.data ?? [];

  const update = (patch: Partial<CatalogSearch>) => {
    navigate({
      search: (prev) => ({ ...(prev as CatalogSearch), ...patch }),
      replace: true,
      resetScroll: false,
    });
  };

  const clearAll = () => {
    navigate({ search: DEFAULTS, replace: true, resetScroll: false });
  };

  const levels = useMemo(
    () => Array.from(new Set(courses.map((c) => c.level))),
    [courses],
  );

  const filtered = useMemo(() => {
    const q = search.q.trim().toLowerCase();
    const wl = WORKLOAD_BUCKETS[search.workload] ?? WORKLOAD_BUCKETS.all;
    const pr = PRICE_OPTIONS[search.price] ?? PRICE_OPTIONS.all;
    return courses.filter((c) => {
      if (search.track !== "all" && c.track_id !== search.track) return false;
      if (search.level !== "all" && c.level !== search.level) return false;
      const hours = c.workload_hours > 0 ? c.workload_hours : Math.round(c.duration_minutes / 60);
      if (!wl.test(hours)) return false;
      if (!pr.test(c.is_free, Number(c.price ?? 0))) return false;
      if (q && !(c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [courses, search]);

  const trackById = useMemo(
    () => new Map(tracks.map((t) => [t.id, t])),
    [tracks],
  );

  const loading = tracksQ.isLoading || coursesQ.isLoading;

  const activeChips: Array<{ key: keyof CatalogSearch; label: string }> = [];
  if (search.q) activeChips.push({ key: "q", label: `“${search.q}”` });
  if (search.track !== "all") {
    const t = tracks.find((x) => x.id === search.track);
    if (t) activeChips.push({ key: "track", label: t.title });
  }
  if (search.level !== "all") activeChips.push({ key: "level", label: search.level });
  if (search.workload !== "all") activeChips.push({ key: "workload", label: WORKLOAD_BUCKETS[search.workload].label });
  if (search.price !== "all") activeChips.push({ key: "price", label: PRICE_OPTIONS[search.price].label });

  const hasActive = activeChips.length > 0;

  return (
    <>
      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="Catálogo"
          title="Todos os cursos da plataforma."
          description="Filtre por interesse, nível ou carga horária. Conteúdo atualizado conforme o mercado evolui."
        />

        {/* Barra de busca + filtros desktop */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-background px-5 py-3 shadow-sm">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={search.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Buscar por nome do curso ou tema…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {search.q && (
              <button
                type="button"
                onClick={() => update({ q: "" })}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Selects em telas grandes */}
          <div className="hidden gap-3 lg:flex">
            <FilterSelect
              value={search.track}
              onChange={(v) => update({ track: v })}
              options={[["all", "Todos os temas"], ...tracks.map((t) => [t.id, t.title] as [string, string])]}
            />
            <FilterSelect
              value={search.level}
              onChange={(v) => update({ level: v })}
              options={[["all", "Todos os níveis"], ...levels.map((l) => [l, l] as [string, string])]}
            />
            <FilterSelect
              value={search.workload}
              onChange={(v) => update({ workload: v })}
              options={Object.entries(WORKLOAD_BUCKETS).map(([k, v]) => [k, v.label])}
            />
            <FilterSelect
              value={search.price}
              onChange={(v) => update({ price: v })}
              options={Object.entries(PRICE_OPTIONS).map(([k, v]) => [k, v.label])}
            />
          </div>

          {/* Botão de abrir filtros no mobile/tablet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="lg:hidden inline-flex h-12 items-center justify-center gap-2 rounded-full border-border"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {hasActive && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {activeChips.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="flex h-[92dvh] flex-col border-white/10 bg-background p-0">
              <SheetTitle className="sr-only">Filtros do catálogo</SheetTitle>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="font-display text-lg font-semibold">Filtrar cursos</p>
                  <p className="text-xs text-muted-foreground">
                    {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">
                <FilterGroup
                  label="Tema"
                  value={search.track}
                  onChange={(v) => update({ track: v })}
                  options={[["all", "Todos"], ...tracks.map((t) => [t.id, t.title] as [string, string])]}
                />
                <FilterGroup
                  label="Nível"
                  value={search.level}
                  onChange={(v) => update({ level: v })}
                  options={[["all", "Todos"], ...levels.map((l) => [l, l] as [string, string])]}
                />
                <FilterGroup
                  label="Carga horária"
                  value={search.workload}
                  onChange={(v) => update({ workload: v })}
                  options={Object.entries(WORKLOAD_BUCKETS).map(([k, v]) => [k, v.label])}
                />
                <FilterGroup
                  label="Preço"
                  value={search.price}
                  onChange={(v) => update({ price: v })}
                  options={Object.entries(PRICE_OPTIONS).map(([k, v]) => [k, v.label])}
                />
              </div>

              <div
                className="sticky bottom-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
              >
                <Button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-12 w-full rounded-full text-sm font-semibold"
                >
                  Aplicar filtros ({filtered.length})
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Chips de filtros ativos */}
        {hasActive && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Ativos:</span>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => update({ [chip.key]: DEFAULTS[chip.key] } as Partial<CatalogSearch>)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </Section>

      <Section>
        <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {loading ? "Carregando…" : `${filtered.length} ${filtered.length === 1 ? "curso" : "cursos"}`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-muted-foreground">Nenhum curso encontrado com esses filtros.</p>
            <Button type="button" variant="outline" onClick={clearAll} className="rounded-full">
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const track = trackById.get(c.track_id);
              const Icon = getIcon(track?.icon);
              return (
                <Link
                  key={c.id}
                  to="/curso/$slug/oferta"
                  params={{ slug: c.slug }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.4)]"
                >
                  <div className="relative h-28 overflow-hidden border-b border-border bg-surface">
                    <Icon className="absolute right-5 top-5 h-10 w-10 text-foreground/90 transition-transform group-hover:scale-110" />
                    {track ? (
                      <span className="absolute bottom-3 left-5 inline-flex items-center rounded-full border border-border bg-background/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
                        {track.tag}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-semibold tracking-tight">
                        {c.title}
                      </h3>
                      <span
                        className={
                          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium " +
                          (c.is_free
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-primary/10 text-primary")
                        }
                      >
                        {c.is_free
                          ? "Gratuito"
                          : `R$ ${Number(c.price ?? 0).toFixed(2).replace(".", ",")}`}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {c.workload_hours > 0 ? `${c.workload_hours}h` : `${Math.round(c.duration_minutes / 60)}h`} · {c.level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-foreground">
                        Ver detalhes <ArrowUpRight className="h-3.5 w-3.5" />
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

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-border bg-background px-4 py-3 text-sm outline-none"
    >
      {options.map(([v, label]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={
                "min-h-11 rounded-full border px-4 text-sm transition " +
                (active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/40")
              }
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
