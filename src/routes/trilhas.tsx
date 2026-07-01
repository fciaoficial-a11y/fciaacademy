import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Loader2, Search, SearchX } from "lucide-react";
import { Section, SectionHeading, Eyebrow } from "@/components/site/Section";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { tracksQuery } from "@/lib/catalog-queries";
import { getIcon } from "@/lib/icon-map";
import { supabase } from "@/integrations/supabase/client";
import { queryOptions, useQuery as useRQ } from "@tanstack/react-query";
import { currentPlanIdQuery, canAccess, type PlanId } from "@/lib/plans";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/trilhas")({
  head: () => ({
    meta: [
      { title: "Trilhas — FCIA Academy" },
      { name: "description", content: "Catálogo de trilhas em IA, tecnologia, marketing, negócios e carreira." },
      { property: "og:title", content: "Trilhas FCIA Academy" },
      { property: "og:description", content: "Jornadas de aprendizado orientadas a resultado." },
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

// Track com required_plan
const tracksWithPlanQuery = queryOptions({
  queryKey: ["tracks", "with-plan"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("tracks")
      .select("id, slug, title, description, tag, level, hours, modules, icon, outcomes, sort_order, required_plan")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Array<{
      id: string; slug: string; title: string; description: string; tag: string;
      level: string; hours: string; modules: number; icon: string; outcomes: string[];
      sort_order: number; required_plan: PlanId | null;
    }>;
  },
  staleTime: 60_000,
});

const currentUserIdQuery = queryOptions({
  queryKey: ["auth", "user-id"],
  queryFn: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  },
  staleTime: 60_000,
});

type AccessFilter = "all" | "free" | "paid";
type SortOption = "recommended" | "shortest" | "longest";

function TrilhasPage() {
  const tracksQ = useQuery(tracksWithPlanQuery);
  const user = useRQ(currentUserIdQuery);
  const plan = useRQ(currentPlanIdQuery(user.data ?? undefined));

  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [access, setAccess] = useState<AccessFilter>("all");
  const [sort, setSort] = useState<SortOption>("recommended");

  const tracks = tracksQ.data ?? [];
  const currentPlan = plan.data ?? "free";

  const tags = useMemo(() => Array.from(new Set(tracks.map((t) => t.tag))).sort(), [tracks]);
  const levels = useMemo(() => Array.from(new Set(tracks.map((t) => t.level))).sort(), [tracks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = tracks.filter((t) => {
      if (q && !`${t.title} ${t.description} ${t.tag}`.toLowerCase().includes(q)) return false;
      if (tag !== "all" && t.tag !== tag) return false;
      if (level !== "all" && t.level !== level) return false;
      if (access !== "all") {
        const req = (t.required_plan ?? "free") as PlanId;
        if (access === "free" && req !== "free") return false;
        if (access === "paid" && req === "free") return false;
      }
      return true;
    });
    const hoursNum = (s: string) => parseInt(s.replace(/\D/g, ""), 10) || 0;
    if (sort === "shortest") list.sort((a, b) => hoursNum(a.hours) - hoursNum(b.hours));
    else if (sort === "longest") list.sort((a, b) => hoursNum(b.hours) - hoursNum(a.hours));
    return list;
  }, [tracks, search, tag, level, access, sort]);

  return (
    <>
      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="Trilhas FCIA"
          title="Escolha a trilha que te leva ao próximo passo."
          description="Cada trilha entrega uma transformação concreta: novas habilidades, um novo posicionamento ou um novo modelo de renda."
        />
      </Section>

      {/* Filtros */}
      <Section className="border-b border-border">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar trilha, área ou objetivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Área" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as áreas</SelectItem>
              {tags.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Nível" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              {levels.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={access} onValueChange={(v) => setAccess(v as AccessFilter)}>
            <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Acesso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer acesso</SelectItem>
              <SelectItem value="free">Gratuita</SelectItem>
              <SelectItem value="paid">Premium</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Ordenar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recomendado</SelectItem>
              <SelectItem value="shortest">Carga: menor primeiro</SelectItem>
              <SelectItem value="longest">Carga: maior primeiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section className="border-b border-border">
        {tracksQ.isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-background/40 py-20 text-center">
            <SearchX className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-display text-xl font-semibold">Nada encontrado por aqui.</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Ajuste os filtros ou limpe a busca para ver todas as trilhas disponíveis.
            </p>
            <button
              onClick={() => { setSearch(""); setTag("all"); setLevel("all"); setAccess("all"); setSort("recommended"); }}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
            {filtered.map((t) => {
              const Icon = getIcon(t.icon);
              const req = (t.required_plan ?? "free") as PlanId;
              const badge = accessBadge(req, currentPlan, Boolean(user.data));
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
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.tag}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
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
                    <span>{t.level} · {t.modules} módulos · {t.hours}</span>
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
          <Eyebrow>Não sabe por onde começar?</Eyebrow>
          <h3 className="mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Assine um plano e destrave todas as trilhas premium da FCIA.
          </h3>
          <Link
            to="/planos"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
          >
            Ver planos <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Testimonials />
      <FAQ />
    </>
  );
}

function accessBadge(required: PlanId, current: PlanId, isLogged: boolean) {
  if (required === "free") {
    return { label: "Grátis", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" };
  }
  if (isLogged && canAccess(current, required)) {
    return { label: "Incluída no seu plano", className: "bg-primary/15 text-primary border border-primary/30" };
  }
  return { label: "Premium", className: "bg-accent/15 text-accent border border-accent/30" };
}
