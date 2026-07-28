import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { enrollmentQuery } from "@/lib/enrollments";
import { PixCheckout } from "@/components/payments/PixCheckout";
import { PostPurchaseUpsell } from "@/components/payments/PostPurchaseUpsell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShuffleCards } from "@/components/ui/testimonial-cards";
import { buildPriceAnchor, resolveOfferVariant } from "@/lib/offer-ab";
import {
  fillFaqPlaceholders,
  resolveCourseTemplate,
} from "@/lib/course-template";
import fernandoImg from "@/assets/fernando-cabral.webp.asset.json";
import micPillarCriar from "@/assets/mic-pillar-criar.jpg";
import micPillarEncantar from "@/assets/mic-pillar-encantar.jpg";
import micPillarVender from "@/assets/mic-pillar-vender.jpg";
import micShowcase from "@/assets/mic-showcase.jpg";

const VISUAL_MAP: Record<string, string> = {
  "/__mic_pillar/criar": micPillarCriar,
  "/__mic_pillar/encantar": micPillarEncantar,
  "/__mic_pillar/vender": micPillarVender,
  "/__mic_showcase": micShowcase,
};
function resolveVisual(v?: string): string | undefined {
  if (!v) return undefined;
  return VISUAL_MAP[v] ?? v;
}

interface OfferModule {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

interface OfferCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_url: string | null;
  workload_hours: number;
  price: number;
  level: string;
  certificate_enabled: boolean;
  modules: OfferModule[];
}

function offerQuery(slug: string) {
  return queryOptions({
    queryKey: ["course-offer", slug],
    queryFn: async (): Promise<OfferCourse | null> => {
      const { data: course, error } = await supabase
        .from("courses")
        .select(
          "id, slug, title, description, cover_url, workload_hours, price, level, certificate_enabled, is_published",
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;

      const { data: modules, error: mErr } = await supabase
        .from("modules")
        .select("id, title, description, sort_order")
        .eq("course_id", course.id)
        .eq("is_published", true)
        .order("sort_order");
      if (mErr) throw mErr;

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        cover_url: course.cover_url,
        workload_hours: course.workload_hours,
        price: Number(course.price ?? 0),
        level: course.level,
        certificate_enabled: !!course.certificate_enabled,
        modules: (modules ?? []) as OfferModule[],
      };
    },
    staleTime: 60_000,
  });
}

export const Route = createFileRoute("/curso/$slug/oferta")({
  validateSearch: (search: Record<string, unknown>): { v?: "A" | "B" | "C" } => {
    const v = search.v;
    return v === "A" || v === "B" || v === "C" ? { v } : {};
  },
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(offerQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.title} — Oferta Oficial | FCIA Academy`
      : "Curso — FCIA Academy";
    const description = loaderData?.description ?? "Curso profissional com certificado FCIA Academy.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(loaderData?.cover_url
          ? [
              { property: "og:image", content: loaderData.cover_url },
              { name: "twitter:image", content: loaderData.cover_url },
            ]
          : []),
      ],
    };
  },
  component: OfferPage,
});

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Landing enxuta e visual-first.
 * Filosofia:
 * - Uma única CTA principal repetida somente em pontos-chave.
 * - Capa é a protagonista do hero, sem overlays que a ocultem.
 * - Zero linguagem transacional (PIX/valores) acima da dobra.
 * - Módulos em accordion 100% fechado por padrão.
 * - Blocos densos, curtos, com respiro; sem repetir a mesma promessa.
 */
function OfferPage() {
  const { slug } = Route.useParams();
  const { data: course } = useSuspenseQuery(offerQuery(slug));
  const { user, loading: authLoading } = useAuth();
  const enrollment = useQuery(enrollmentQuery(course?.id, user?.id));
  const [showCheckout, setShowCheckout] = useState(false);
  const [justPaid, setJustPaid] = useState(false);

  useEffect(() => {
    if (!showCheckout) return;
    const el = document.getElementById("comprar");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showCheckout]);

  if (!course) return null;

  const price = course.price;
  const anchorPrice = Math.round(price * 1.6);
  const installment12 = price / 12;
  const perDay = price / 365;
  const alreadyOwns = !!enrollment.data;

  const template = resolveCourseTemplate({
    slug: course.slug,
    title: course.title,
    description: course.description,
  });
  const { hero, testimonials, faq, method, transformation, bonuses, authority, guarantee, finalCta } = template;

  const { v: variantOverride } = Route.useSearch();
  const variant = resolveOfferVariant(course.slug, variantOverride);
  const priceCopy = buildPriceAnchor(
    variant,
    { price, anchorPrice, installment12, perDay },
    formatBRL,
  );

  const faqVars = {
    price: formatBRL(price),
    perDay: formatBRL(perDay),
    workload: `${course.workload_hours}h`,
  };

  const heroImageUrl =
    course.cover_url ?? "/__l5e/assets-v1/placeholder/course-cover.jpg";

  const isMasterclass = course.slug === "metodo-ia-criativa";
  const productNoun = isMasterclass ? "masterclass" : "curso";
  // CTA neutro no topo (sem linguagem transacional / sem PIX).
  const softCtaLabel = alreadyOwns
    ? "Você já tem acesso"
    : isMasterclass ? "Quero acessar a masterclass" : "Quero acessar o curso";
  // CTA transacional só perto do preço.
  const hardCtaLabel = alreadyOwns ? "Você já tem acesso" : variant.primaryCta;

  const scrollToOffer = () => {
    const el = document.getElementById("oferta");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===================== HERO — capa protagonista ===================== */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15),transparent_60%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-10 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
          {/* Texto — enxuto */}
          <div className="order-2 min-w-0 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {hero.eyebrow}
            </span>
            <h1 className="mt-5 font-display text-[2.1rem] font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-[3.4rem]">
              {variant.heroHeadline ?? hero.headline}
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              {variant.heroSubheadline ?? hero.subheadline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-12 px-6 text-base"
                onClick={scrollToOffer}
                disabled={alreadyOwns}
              >
                {softCtaLabel}
              </Button>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> Garantia de 7 dias
              </span>
            </div>
          </div>

          {/* Capa — inteira, sem overlays cobrindo */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card/40 shadow-2xl shadow-primary/20 ring-1 ring-primary/10 lg:max-w-none">
              <img
                src={heroImageUrl}
                alt={`Capa do curso ${course.title}`}
                loading="eager"
                fetchPriority="high"
                className="w-full h-auto object-contain"
              />

              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
                <Sparkles className="h-3 w-3" /> {isMasterclass ? "Masterclass" : "Curso oficial"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRUST STRIP — mínima ===================== */}
      <section className="border-b border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-primary" /> Certificado reconhecido
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> {course.workload_hours}h aplicadas
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Acesso vitalício
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current text-primary" /> Método FCIA
          </span>
        </div>
      </section>

      {/* ===================== MÉTODO — 3 pilares, sem intro longa ===================== */}
      {method && (
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                O método
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                {method.title}
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {method.pillars.map((p, i) => {
                const pillarImg = resolveVisual(p.image);
                return (
                  <div
                    key={p.name}
                    className="group overflow-hidden rounded-2xl border border-border/60 bg-card/40"
                  >
                    {pillarImg && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={pillarImg}
                          alt={p.imageAlt ?? p.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="font-display text-[11px] uppercase tracking-[0.16em] text-primary">
                        Pilar {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="mt-1.5 font-display text-xl font-bold">{p.name}</div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===================== TRANSFORMAÇÃO — pares curtos ===================== */}
      {transformation && (
        <section className="border-b border-border/60 bg-card/20">
          <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
            <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
              {transformation.title}
            </h2>

            <div className="mt-8 grid gap-2.5 md:grid-cols-2">
              {transformation.pairs.slice(0, 6).map((pair) => (
                <div
                  key={pair.before}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground line-through decoration-muted-foreground/40">
                    {pair.before}
                  </span>
                  <span className="text-primary">→</span>
                  <span className="font-medium">{pair.after}</span>
                </div>
              ))}
            </div>

            {transformation.synthesis && (
              <p className="mt-10 max-w-2xl font-display text-lg italic text-foreground/90 sm:text-xl">
                “{transformation.synthesis}”
              </p>
            )}
          </div>
        </section>
      )}

      {/* ===================== MÓDULOS — accordion 100% fechado ===================== */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              Currículo
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              {course.modules.length} aulas-mestras
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Toque em cada aula para abrir o conteúdo.
            </p>
          </div>

          <div className="mt-8 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/50">
            {course.modules.map((m, idx) => (
              <ModuleAccordionItem
                key={m.id}
                index={idx}
                title={m.title}
                description={m.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== BÔNUS — grid compacto (opcional) ===================== */}
      {bonuses && (
        <section className="border-b border-border/60 bg-card/20">
          <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Bônus inclusos
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                {bonuses.title}
              </h2>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {bonuses.bonuses.slice(0, 4).map((b, i) => (
                <div key={b.name} className="rounded-2xl border border-border/60 bg-card/50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Bônus {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="mt-1 font-display text-base font-semibold leading-snug">
                        {b.name}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {b.value}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{b.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== AUTORIDADE — card único, compacto ===================== */}
      {authority && (
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
            <div className="rounded-3xl border border-border/60 bg-card/40 p-6 sm:p-10">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <img
                  src={fernandoImg.url}
                  alt={authority.instructorName}
                  loading="lazy"
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-primary/30"
                />
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-primary">
                    {authority.instructorRole}
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    {authority.instructorName}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {authority.instructorBio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== PROVA SOCIAL — 3 curtas ===================== */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="max-w-xl font-display text-3xl font-bold sm:text-4xl">
                Quem aplicou, virou a chave.
              </h2>
              <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
                Arraste os cards para ver diferentes histórias de quem aplicou o método.
              </p>
            </div>
            <ShuffleCards
              items={testimonials.slice(0, 3).map((t) => ({
                quote: t.quote,
                name: t.name,
                role: t.role,
                initials: t.initials,
                photoUrl: t.photoUrl ?? undefined,
              }))}
            />
          </div>
        </div>

      </section>

      {/* ===================== OFERTA — bloco de fechamento único ===================== */}
      <section id="oferta" className="border-b border-border/60 bg-gradient-to-b from-background to-primary/5">
        <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
          <div className="rounded-3xl border border-primary/30 bg-card/60 p-6 shadow-xl shadow-primary/5 sm:p-10">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                {finalCta?.eyebrow ?? "Oferta oficial"}
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                {variant.finalCtaHeadline}
              </h2>

              <div className="mt-8 flex flex-col items-center gap-1">
                {priceCopy.strike && (
                  <span className="text-sm text-muted-foreground line-through">
                    {priceCopy.strike}
                  </span>
                )}
                <span className="font-display text-5xl font-bold tracking-tight text-primary sm:text-6xl">
                  {priceCopy.primary}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {priceCopy.supporting[0]}
                </span>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  className="h-12 w-full max-w-sm text-base"
                  onClick={() => setShowCheckout(true)}
                  disabled={alreadyOwns}
                >
                  {hardCtaLabel}
                </Button>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    7 dias de garantia
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    Pagamento seguro · Asaas
                  </span>
                </div>
              </div>
            </div>

            <ul className="mt-8 grid gap-2.5 border-t border-border/60 pt-6 text-sm sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Acesso vitalício + atualizações</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{course.workload_hours}h aplicadas + materiais</span>
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Certificado reconhecido (Lei 9.394/96)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Suporte por WhatsApp</span>
              </li>
            </ul>
          </div>

          {/* Garantia — compacta abaixo da oferta */}
          {guarantee && (
            <div className="mt-8 rounded-2xl border border-primary/20 bg-card/40 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold">{guarantee.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{guarantee.body}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===================== CHECKOUT ===================== */}
      {showCheckout && (
        <section id="comprar" className="border-b border-border/60 bg-card/20">
          <div className="mx-auto max-w-2xl px-4 py-12">
            <div className="mb-4 text-center">
              <h2 className="font-display text-2xl font-bold">Finalize sua matrícula</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gere o PIX abaixo e pague pelo app do seu banco — acesso liberado automaticamente.
              </p>
            </div>

            {authLoading ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : !user ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Para concluir a compra, entre com sua conta FCIA (ou crie uma em 30 segundos).
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button asChild>
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/register">Criar conta</Link>
                  </Button>
                </div>
              </div>
            ) : alreadyOwns ? (
              <>
                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-2 text-sm">Você já está matriculado neste curso.</p>
                  <Button asChild className="mt-4">
                    <Link to="/curso/$slug" params={{ slug: course.slug }}>Ir para o curso</Link>
                  </Button>
                </div>
                <PostPurchaseUpsell purchasedSlug={course.slug} />
              </>
            ) : (
              <>
                <PixCheckout mode="course" courseId={course.id} title={course.title} onPaid={() => setJustPaid(true)} />
                {justPaid && <PostPurchaseUpsell purchasedSlug={course.slug} />}
              </>
            )}
          </div>
        </section>
      )}

      {/* ===================== FAQ — compacta ===================== */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
            Perguntas frequentes
          </h2>
          <div className="mt-8 space-y-2.5">
            {faq.slice(0, 6).map((item) => (
              <FaqItem key={item.q} q={fillFaqPlaceholders(item.q, faqVars)}>
                {fillFaqPlaceholders(item.a, faqVars)}
              </FaqItem>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STICKY MOBILE CTA ===================== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_-12px_hsl(var(--primary)/0.25)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
              Acesso vitalício
            </div>
            <div className="font-display text-lg font-bold text-primary">
              {priceCopy.primary}
            </div>
          </div>
          <Button
            className="h-11 shrink-0 px-4 text-sm font-semibold"
            onClick={() => setShowCheckout(true)}
            disabled={alreadyOwns}
          >
            {alreadyOwns ? "Acessar" : variant.primaryCtaShort}
          </Button>
        </div>
      </div>
      <div aria-hidden className="h-24 md:hidden" />
    </div>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border/60 bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium sm:text-base">{q}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180 text-primary")} />
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>}
    </div>
  );
}

function ModuleAccordionItem({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-primary/5 md:px-5"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 font-display text-xs font-bold text-primary">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-snug sm:text-base">{title}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180 text-primary",
          )}
        />
      </button>
      {open && description && (
        <div className="border-t border-border/40 bg-background/40 px-4 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground md:px-5 md:pl-[4.75rem]">
          {description}
        </div>
      )}
    </div>
  );
}
