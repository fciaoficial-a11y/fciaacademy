import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { enrollmentQuery } from "@/lib/enrollments";
import { PixCheckout } from "@/components/payments/PixCheckout";
import { PostPurchaseUpsell } from "@/components/payments/PostPurchaseUpsell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildPriceAnchor, resolveOfferVariant } from "@/lib/offer-ab";
import {
  fillFaqPlaceholders,
  resolveCourseTemplate,
} from "@/lib/course-template";
import fernandoImg from "@/assets/fernando-cabral.webp.asset.json";

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

// Todo conteúdo editorial por curso (audiência, depoimentos, FAQ, herói)
// vive em `src/lib/course-template.ts`. Este componente apenas consome
// o template resolvido. Publicar um novo curso = criar no banco + (opcional)
// adicionar override lá. Layout, ordem de seções e regras de conversão
// são fixos aqui e não devem ser editados por curso.

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
  const { hero, audience, testimonials, faq, pain, method, transformation, bonuses, valueStack, authority, guarantee, finalCta } = template;

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {variant.heroEyebrow ?? hero.eyebrow}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {variant.heroHeadline ?? hero.headline}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {variant.heroSubheadline ?? hero.subheadline}
            </p>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur">
              <img
                src={fernandoImg.url}
                alt="Fernando Cabral, professor da FCIA Academy"
                loading="eager"
                className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/40"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Fernando Cabral</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                    <BadgeCheck className="h-3 w-3" /> Especialista em IA
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  “{hero.professorQuote}”
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="text-base"
                onClick={() => setShowCheckout(true)}
                disabled={alreadyOwns}
              >
                {alreadyOwns ? "Você já tem acesso" : variant.primaryCta}
              </Button>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> 7 dias de garantia
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border/60 shadow-2xl shadow-primary/10">
              <img
                src={heroImageUrl}
                alt={`Capa do curso ${course.title}`}
                loading="eager"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-xl md:flex">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Carga horária</div>
                <div className="mt-0.5 font-display text-2xl font-bold">{course.workload_hours}h</div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary"
                title="Certificado reconhecido conforme a Lei 9.394/96 (LDB)"
              >
                <BadgeCheck className="h-3.5 w-3.5" /> Certificado reconhecido
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROVA SOCIAL ============ */}
      <section className="border-b border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4">
          <SocialStat icon={<GraduationCap className="h-5 w-5" />} label="Primeira turma" value="Vagas abertas" />
          <SocialStat icon={<Star className="h-5 w-5" />} label="Avaliação" value="4.9/5" />
          <SocialStat icon={<Award className="h-5 w-5" />} label="Certificado" value="Reconhecido" />
          <SocialStat icon={<Zap className="h-5 w-5" />} label="Acesso" value="Vitalício" />
        </div>
      </section>

      {/* ============ DOR (opcional) ============ */}
      {pain && (
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {pain.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {pain.intro}
            </p>
            <ul className="mt-8 space-y-3">
              {pain.bullets.map((b) => (
                <li
                  key={b}
                  className="flex gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 text-sm"
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {pain.transition && (
              <p className="mt-8 border-l-2 border-primary/60 pl-4 text-base font-medium text-foreground/90">
                {pain.transition}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ============ MÉTODO (opcional) ============ */}
      {method && (
        <section className="border-b border-border/60 bg-card/20">
          <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {method.title}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {method.intro}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {method.pillars.map((p, i) => (
                <div
                  key={p.name}
                  className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-card/40 p-6"
                >
                  <div className="font-display text-xs uppercase tracking-[0.16em] text-primary">
                    Pilar {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold">{p.name}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
                </div>
              ))}
            </div>

            {method.integrationItems && method.integrationItems.length > 0 && (
              <div className="mt-10 rounded-3xl border border-border/60 bg-card/40 p-6 md:p-8">
                {method.integrationTitle && (
                  <h3 className="font-display text-lg font-semibold">{method.integrationTitle}</h3>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {method.integrationItems.map((it) => (
                    <div key={it.label} className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <div className="font-semibold text-primary">{it.label}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {method.differentiator && (
              <p className="mt-8 max-w-3xl text-base leading-relaxed text-foreground/90">
                {method.differentiator}
              </p>
            )}
            {method.transition && (
              <p className="mt-4 border-l-2 border-primary/60 pl-4 text-base font-medium text-foreground/90">
                {method.transition}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ============ TRANSFORMAÇÃO (opcional) ============ */}
      {transformation && (
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {transformation.title}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {transformation.intro}
            </p>

            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {transformation.pairs.map((pair) => (
                <div
                  key={pair.before}
                  className="grid grid-cols-1 gap-2 rounded-2xl border border-border/60 bg-card/40 p-4 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4"
                >
                  <div className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                    {pair.before}
                  </div>
                  <div className="hidden text-primary md:block">→</div>
                  <div className="text-sm font-medium text-foreground">{pair.after}</div>
                </div>
              ))}
            </div>

            {transformation.synthesis && (
              <p className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center font-display text-lg font-semibold text-foreground">
                {transformation.synthesis}
              </p>
            )}
            {transformation.transition && (
              <p className="mt-4 border-l-2 border-primary/60 pl-4 text-base font-medium text-foreground/90">
                {transformation.transition}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ============ VALUE STACK / ANCORAGEM ============ */}
      {valueStack && (
        <section className="border-b border-border/60 bg-gradient-to-b from-transparent to-primary/5">
          <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                O que entra no pacote
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl md:text-4xl">
                {valueStack.title}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
                {valueStack.intro}
              </p>
            </div>

            <ul className="mt-8 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
              {valueStack.items.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium leading-snug">{item.label}</p>
                      {item.note && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
                      )}
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-muted-foreground">
                    {item.value}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 rounded-b-2xl bg-primary/10 px-4 py-4 sm:px-6">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  Total
                </span>
                <span className="font-display text-lg font-bold text-primary">
                  {valueStack.totalLabel}
                </span>
              </li>
            </ul>

            <p className="mt-8 text-center text-base text-muted-foreground">
              {valueStack.transition}
            </p>

            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="font-display text-5xl font-bold tracking-tight text-primary sm:text-6xl">
                {valueStack.priceHighlight}
              </span>
              <span className="text-sm text-muted-foreground">{valueStack.priceCaption}</span>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="w-full max-w-sm text-base"
                onClick={() => setShowCheckout(true)}
                disabled={alreadyOwns}
              >
                {alreadyOwns ? "Você já tem acesso a este curso" : valueStack.ctaLabel}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {valueStack.riskNote}
              </p>
            </div>

            <p className="mx-auto mt-10 max-w-2xl border-t border-border/60 pt-6 text-center font-display text-base italic text-foreground/90 sm:text-lg">
              {valueStack.closing}
            </p>
          </div>
        </section>
      )}

      {/* ============ AUTORIDADE ============ */}
      {authority && (
        <section className="border-b border-border/60 bg-card/20">
          <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {authority.eyebrow}
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl md:text-4xl">
                {authority.title}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
                {authority.intro}
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {authority.points.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/40 p-4"
                >
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium leading-snug">{point.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold">{authority.instructorName}</p>
                  <p className="text-xs uppercase tracking-wider text-primary/90">
                    {authority.instructorRole}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{authority.instructorBio}</p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm italic text-muted-foreground">
              {authority.transition}
            </p>
          </div>
        </section>
      )}

      {/* ============ OFERTA ============ */}

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-card/40 p-6 shadow-xl shadow-primary/5 md:p-10">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Oferta de lançamento
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                {variant.offerTitle}
              </h2>

              <div className="mt-6 flex flex-col items-center gap-1">
                {priceCopy.strike && (
                  <span className="text-sm text-muted-foreground line-through">
                    {priceCopy.strike}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">por</span>
                  <span className="font-display text-5xl font-bold tracking-tight text-primary sm:text-6xl">
                    {priceCopy.primary}
                  </span>
                </div>
                {priceCopy.supporting.map((line, i) => (
                  <span
                    key={i}
                    className={i === 0 ? "mt-2 text-sm text-muted-foreground" : "text-xs text-muted-foreground"}
                  >
                    {line}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  className="w-full max-w-sm text-base"
                  onClick={() => setShowCheckout(true)}
                  disabled={alreadyOwns}
                >
                  {alreadyOwns ? "Você já tem acesso a este curso" : variant.primaryCta}
                </Button>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Garantia incondicional de 7 dias
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-primary" />
                    Pagamento seguro · Asaas · PIX Banco Central
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 border-t border-border/60 pt-6 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Acesso vitalício ao curso e às futuras atualizações</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{course.workload_hours}h de conteúdo aplicado + materiais em PDF</span>
              </div>
              <div className="flex items-start gap-2.5">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Certificado digital reconhecido —{" "}
                  <strong className="text-foreground">curso livre nos termos da Lei 9.394/96</strong>,
                  com código público de validação
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Suporte por WhatsApp durante todo o curso</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CHECKOUT (aparece ao clicar) ============ */}
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
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Ambiente seguro · Asaas · PIX regulado pelo Banco Central
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ============ PARA QUEM É / NÃO É ============ */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Este curso é para você?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Leia antes de comprar. Preferimos que você entre certo do que peça reembolso depois.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-primary/30 bg-card/40 p-6 md:p-8">
              <h3 className="font-display text-xl font-bold text-primary">Para quem é este curso</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {audience.forWhom.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/20 p-6 md:p-8">
              <h3 className="font-display text-xl font-bold text-muted-foreground">
                Para quem NÃO é este curso
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {audience.notForWhom.map((item) => (
                  <li key={item} className="flex gap-2">
                    <X className="mt-0.5 h-5 w-5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MÓDULOS ============ */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">O que você vai aprender</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {course.modules.length} módulos · {course.workload_hours}h de conteúdo aplicado
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {course.modules.map((m, idx) => (
              <div
                key={m.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/40 md:p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 font-display text-sm font-bold text-primary">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{m.title}</h3>
                    {m.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BÔNUS (opcional) ============ */}
      {bonuses && (
        <section className="border-b border-border/60 bg-card/20">
          <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-display text-xs uppercase tracking-[0.16em] text-primary">
                Bônus inclusos
              </span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {bonuses.title}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {bonuses.intro}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {bonuses.bonuses.map((b, i) => (
                <div
                  key={b.name}
                  className="rounded-2xl border border-border/60 bg-card/40 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Bônus {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="mt-1 font-display text-lg font-semibold">{b.name}</div>
                    </div>
                    <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {b.value}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground/90">{b.purpose}</p>
                  {b.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                  )}
                </div>
              ))}
            </div>

            {(bonuses.totalLabel || bonuses.closing) && (
              <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
                {bonuses.totalLabel && (
                  <div className="font-display text-2xl font-bold text-primary">
                    {bonuses.totalLabel}
                  </div>
                )}
                {bonuses.closing && (
                  <p className="mt-2 text-sm text-foreground/90">{bonuses.closing}</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============ CERTIFICADO ============ */}
      {course.certificate_enabled && (
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
            <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-2xl border border-primary/30 bg-primary/10 md:mx-0">
                <Award className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">
                  Certificado com validade legal
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Curso livre de capacitação profissional, emitido de acordo com a
                  <strong className="text-foreground"> Lei 9.394/96</strong> — a mesma lei que rege a
                  educação no Brasil. Você recebe um certificado digital com QR Code e código público
                  de validação, aceito em currículos, LinkedIn e processos de RH.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Verificação online
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Carga: {course.workload_hours}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ DEPOIMENTOS ============ */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              <Star className="h-3.5 w-3.5 fill-current" />
              Prova social
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
              Quem aplicou o método já sentiu a virada.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Relatos curtos de perfis diferentes — criador, dono de negócio e freelancer — mostrando o tipo de mudança prática que o método provoca na rotina de produção.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name + t.quote.slice(0, 12)}
                className="flex flex-col rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm"
              >
                <div className="flex gap-0.5 text-primary" aria-label="5 estrelas">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {t.result}
                </div>

                <blockquote className="mt-4 grow text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>

                <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                  {t.photoUrl ? (
                    <img
                      src={t.photoUrl}
                      alt={t.name}
                      loading="lazy"
                      className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/25 to-accent/25 text-sm font-semibold text-primary ring-2 ring-primary/20"
                    >
                      {t.initials}
                    </div>
                  )}
                  <div className="min-w-0 text-xs">
                    <div className="truncate font-semibold text-foreground">{t.name}</div>
                    <div className="truncate text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-center text-sm italic text-muted-foreground">
            Antes de decidir, tire as últimas dúvidas — reunimos abaixo o que costuma travar a matrícula.
          </p>
          <p className="mt-3 text-center text-[11px] text-muted-foreground/80">
            Depoimentos ilustrativos marcados como <span className="font-medium">[placeholder verificado]</span>, baseados em conversas com alunos e beta interno. Serão substituídos por relatos autorizados conforme a turma inaugural for concluindo o método.
          </p>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
            Perguntas frequentes
          </h2>
          <div className="mt-8 space-y-3">
            {faq.map((item) => (
              <FaqItem key={item.q} q={fillFaqPlaceholders(item.q, faqVars)}>
                {fillFaqPlaceholders(item.a, faqVars)}
              </FaqItem>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="bg-gradient-to-b from-background to-primary/10">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {variant.finalCtaHeadline}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {course.title} · {course.workload_hours}h · certificado incluso
          </p>

          <div className="mt-8 inline-flex flex-col items-center gap-3">
            {priceCopy.strike && (
              <div className="text-sm text-muted-foreground line-through">{priceCopy.strike}</div>
            )}
            <div className="font-display text-5xl font-bold text-primary sm:text-6xl">
              {priceCopy.primary}
            </div>
            {priceCopy.supporting.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {priceCopy.supporting.join(" · ")}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Button size="lg" className="w-full max-w-sm text-base" onClick={() => setShowCheckout(true)} disabled={alreadyOwns}>
              {alreadyOwns ? "Você já tem acesso" : variant.primaryCta}
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                7 dias de garantia
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-primary" />
                Asaas · PIX Banco Central
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STICKY MOBILE CTA ============ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-muted-foreground">
              {course.workload_hours}h · certificado
            </div>
            <div className="flex items-baseline gap-1">
              {priceCopy.strike && (
                <span className="text-[11px] text-muted-foreground line-through">{priceCopy.strike.replace(/^De\s*/, "")}</span>
              )}
              <span className="font-display text-lg font-bold text-primary">{priceCopy.primary}</span>
            </div>
          </div>
          <Button size="sm" className="shrink-0" onClick={() => setShowCheckout(true)} disabled={alreadyOwns}>
            {alreadyOwns ? "Acessar" : variant.primaryCtaShort}
          </Button>
        </div>
      </div>
      <div aria-hidden className="h-20 md:hidden" />
    </div>
  );
}

function SocialStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="truncate font-semibold">{value}</div>
      </div>
    </div>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="font-medium">{q}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
