import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  BookMarked,
  Clock,
  Flame,
  Loader2,
  Search,
  Signal,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/site/Section";
import { coursesQuery, tracksQuery, type CourseRow, type TrackRow } from "@/lib/catalog-queries";
import { getIcon } from "@/lib/icon-map";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { badgeClass, formatBRL, getCourseSalesMeta } from "@/lib/course-sales-meta";
import ebookMockup from "@/assets/ebook-ia-sem-complicacao/ebook-mockup.jpeg.asset.json";


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
  // Partial: todos os filtros são opcionais na URL, então links internos para
  // /cursos não precisam informar `search`. O componente aplica os defaults.
  validateSearch: (search: Record<string, unknown>): Partial<CatalogSearch> => ({
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
  const rawSearch = Route.useSearch();
  const search: CatalogSearch = { ...DEFAULTS, ...rawSearch };
  const navigate = useNavigate({ from: "/cursos" });
  const [mobileOpen, setMobileOpen] = useState(false);

  const tracks = tracksQ.data ?? [];
  const courses = coursesQ.data ?? [];

  const update = (patch: Partial<CatalogSearch>) => {
    navigate({
      to: ".",
      search: (prev) => ({ ...DEFAULTS, ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    });
  };

  const clearAll = () => {
    navigate({ to: ".", search: DEFAULTS, replace: true, resetScroll: false });
  };

  const levels = useMemo(
    () => Array.from(new Set(courses.map((c) => c.level))),
    [courses],
  );

  // O ebook oficial "ia-sem-complicacao" existe em `courses` (product_type='ebook')
  // apenas para reaproveitar o fluxo PIX/entrega. Ele NÃO faz parte da vitrine de
  // cursos: é exibido em um bloco secundário próprio ("Material oficial"), abaixo.
  const EBOOK_SLUG = "ia-sem-complicacao";

  const filtered = useMemo(() => {
    const q = search.q.trim().toLowerCase();
    const wl = WORKLOAD_BUCKETS[search.workload] ?? WORKLOAD_BUCKETS.all;
    const pr = PRICE_OPTIONS[search.price] ?? PRICE_OPTIONS.all;
    return courses.filter((c) => {
      if (c.slug === EBOOK_SLUG) return false;
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
          (() => {
            const withMeta = filtered.map((c) => ({ c, meta: getCourseSalesMeta(c.slug) }));
            const hero = withMeta.find((x) => x.meta.featurePriority === 0);
            const rest = withMeta.filter((x) => x !== hero);

            return (
              <div className="space-y-8">
                {hero && (
                  <FeaturedCourseCard
                    course={hero.c}
                    track={trackById.get(hero.c.track_id)}
                  />
                )}

                {(rest.length > 0 || !hero) && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map(({ c }) => (
                      <ProductCourseCard
                        key={c.id}
                        course={c}
                        track={trackById.get(c.track_id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        )}
      </Section>

      {/* Bloco secundário — material oficial (ebook), separado da vitrine de cursos */}
      {!loading && !hasActive && (
        <Section className="border-t border-border">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Material oficial
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                Ebook complementar da FCIA
              </h2>
            </div>
          </div>
          <div className="max-w-md">
            <EbookProductCard />
          </div>
        </Section>
      )}
    </>
  );
}

/* ============================================================
 * FEATURED CARD — hero comercial (span total, capa dominante)
 * ============================================================ */
function FeaturedCourseCard({ course, track }: { course: CourseRow; track: TrackRow | undefined }) {
  const meta = getCourseSalesMeta(course.slug);
  const Icon = getIcon(track?.icon);
  const price = Number(course.price ?? 0);
  const hasDiscount = meta.originalPrice && meta.originalPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((meta.originalPrice! - price) / meta.originalPrice!) * 100)
    : 0;
  const hours = course.workload_hours > 0 ? course.workload_hours : Math.round(course.duration_minutes / 60);

  return (
    <Link
      to="/curso/$slug/oferta"
      params={{ slug: course.slug }}
      className="group relative block overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background shadow-[0_30px_70px_-40px_rgba(59,130,246,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_40px_90px_-40px_rgba(59,130,246,0.6)]"
    >
      <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
        {/* Capa */}
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[420px]">
          {course.cover_url ? (
            <img
              src={course.cover_url}
              alt={course.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Icon className="h-24 w-24 text-primary/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-background/20" />

          {/* Selo topo */}
          {meta.badge && (
            <span
              className={
                "absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider " +
                badgeClass(meta.badge.kind)
              }
            >
              <Flame className="h-3.5 w-3.5" />
              {meta.badge.label}
            </span>
          )}

          {hasDiscount && (
            <span className="absolute right-5 top-5 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
              −{discountPct}%
            </span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="relative flex flex-col justify-center gap-5 p-7 lg:p-10">
          {track && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" />
              {track.tag}
            </span>
          )}

          <h3 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2.1rem]">
            {course.title}
          </h3>

          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {meta.hook ?? course.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {hours}h aplicadas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5 text-primary" />
              {course.level}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Certificado reconhecido
            </span>
          </div>

          <div className="flex items-end gap-3 pt-1">
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {formatBRL(meta.originalPrice!)}
              </span>
            )}
            <span className="font-display text-3xl font-black tracking-tight text-primary sm:text-4xl">
              R$ {formatBRL(price)}
            </span>
            <span className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              à vista
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition group-hover:brightness-110">
              {meta.ctaLabel ?? "Ver oferta completa"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Garantia de 7 dias · Acesso vitalício
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
 * PRODUCT CARD — card comercial padrão (vertical)
 * ============================================================ */
function ProductCourseCard({ course, track }: { course: CourseRow; track: TrackRow | undefined }) {
  const meta = getCourseSalesMeta(course.slug);
  const Icon = getIcon(track?.icon);
  const price = Number(course.price ?? 0);
  const hasDiscount = meta.originalPrice && meta.originalPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((meta.originalPrice! - price) / meta.originalPrice!) * 100)
    : 0;
  const hours = course.workload_hours > 0 ? course.workload_hours : Math.round(course.duration_minutes / 60);

  return (
    <Link
      to="/curso/$slug/oferta"
      params={{ slug: course.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_60px_-30px_rgba(59,130,246,0.5)]"
    >
      {/* Capa */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/15 to-background">
        {course.cover_url ? (
          <img
            src={course.cover_url}
            alt={course.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-14 w-14 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Selo status */}
        {meta.badge && (
          <span
            className={
              "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider " +
              badgeClass(meta.badge.kind)
            }
          >
            {meta.badge.label}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            −{discountPct}%
          </span>
        )}

        {/* Categoria (rodapé da capa) */}
        {track && (
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/20 bg-black/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur">
            {track.tag}
          </span>
        )}
      </div>

      {/* Corpo */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight">
          {course.title}
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {meta.hook ?? course.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {hours}h
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1">
            <Signal className="h-3 w-3" />
            {course.level}
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-3 w-3" />
            Certificado
          </span>
        </div>

        {/* Preço */}
        <div className="mt-1 flex items-end gap-2 border-t border-border/60 pt-4">
          {course.is_free ? (
            <span className="font-display text-2xl font-black tracking-tight text-emerald-500">
              Gratuito
            </span>
          ) : (
            <>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  R$ {formatBRL(meta.originalPrice!)}
                </span>
              )}
              <span className="font-display text-2xl font-black tracking-tight text-foreground">
                R$ {formatBRL(price)}
              </span>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
            {meta.ctaLabel ?? "Ver oferta"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            7 dias de garantia
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
 * EBOOK CARD — descoberta interna do produto oficial /ebook-ia-sem-complicacao
 * Mantém o mesmo sistema visual do ProductCourseCard, com selo próprio.
 * ============================================================ */
function EbookProductCard() {
  return (
    <Link
      to="/ebook-ia-sem-complicacao"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_60px_-30px_rgba(59,130,246,0.5)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/15 to-background">
        <img
          src={ebookMockup.url}
          alt="Ebook IA Sem Complicação"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-400/95 to-orange-500/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-[0_8px_24px_-8px_rgba(251,191,36,0.6)]">
          <BookMarked className="h-3 w-3" />
          Ebook oficial
        </span>

        <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/20 bg-black/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur">
          Material · FCIA
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight">
          IA Sem Complicação
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          Guia direto para aplicar IA no dia a dia — mais um bônus com 50 tarefas prontas para vender usando IA.
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BookMarked className="h-3 w-3" />
            Ebook + bônus
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-3 w-3" />
            Acesso imediato
          </span>
        </div>

        <div className="mt-1 flex items-end gap-2 border-t border-border/60 pt-4">
          <span className="font-display text-2xl font-black tracking-tight text-foreground">
            R$ 37,90
          </span>
          <span className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            à vista
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
            Ver ebook
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            7 dias de garantia
          </span>
        </div>
      </div>
    </Link>
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
