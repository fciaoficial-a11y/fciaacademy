import { queryOptions, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";

/**
 * Mapa de complementaridade entre cursos.
 * Chave: slug comprado. Valor: slug complementar sugerido + narrativa combinada.
 */
const UPSELL_MAP: Record<
  string,
  {
    targetSlug: string;
    eyebrow: string;
    headline: string;
    subheadline: string;
    combinedBenefit: string;
    cta: string;
  }
> = {
  "venda-com-ia": {
    targetSlug: "ia-sem-misterio",
    eyebrow: "Complete sua formação",
    headline: "Avance para o próximo nível: IA Sem Mistério",
    subheadline:
      "Você já domina como vender com IA. Agora entenda a fundo como a IA pensa, decide e onde ela se encaixa no seu processo — do zero ao aplicado.",
    combinedBenefit:
      "Juntos, os dois cursos formam uma trilha completa: método de vendas + fundamentos aplicados de IA.",
    cta: "Ver a oferta complementar",
  },
  "ia-sem-misterio": {
    targetSlug: "venda-com-ia",
    eyebrow: "Leve seu aprendizado para a prática",
    headline: "Transforme conhecimento em receita: Venda com IA",
    subheadline:
      "Você já entende a IA por dentro. O passo natural é usar esse repertório para vender mais e melhor — com um método pronto para aplicar.",
    combinedBenefit:
      "Fundamentos + aplicação comercial. É assim que profissionais de IA se destacam no mercado.",
    cta: "Ver a oferta complementar",
  },
};

function upsellCourseQuery(slug: string) {
  return queryOptions({
    queryKey: ["upsell-course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, description, cover_url, workload_hours, price")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function alreadyEnrolledQuery(userId: string | undefined, courseId: string | undefined) {
  return queryOptions({
    queryKey: ["upsell-enrollment", userId, courseId],
    enabled: Boolean(userId && courseId),
    queryFn: async () => {
      if (!userId || !courseId) return false;
      const { data, error } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
    staleTime: 30 * 1000,
  });
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export interface PostPurchaseUpsellProps {
  /** Slug do curso que acabou de ser comprado. */
  purchasedSlug: string;
}

/**
 * Card de upsell/cross-sell exibido após aprovação do pagamento.
 * Não interrompe o fluxo, é opcional, e fácil de recusar (X + "Agora não").
 */
export function PostPurchaseUpsell({ purchasedSlug }: PostPurchaseUpsellProps) {
  const config = UPSELL_MAP[purchasedSlug];
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const { data: target } = useQuery({
    ...upsellCourseQuery(config?.targetSlug ?? ""),
    enabled: Boolean(config?.targetSlug),
  });

  const { data: alreadyOwns } = useQuery(alreadyEnrolledQuery(user?.id, target?.id));

  if (!config || dismissed) return null;
  if (!target) return null;
  if (alreadyOwns) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg">
      <div className="relative p-5 sm:p-6">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Fechar oferta complementar"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
          <Sparkles className="h-3 w-3" />
          {config.eyebrow}
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-[120px,1fr] sm:items-center">
          {target.cover_url && (
            <div className="hidden overflow-hidden rounded-xl border border-border/60 sm:block">
              <img
                src={target.cover_url}
                alt={target.title}
                className="aspect-[4/5] h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold leading-tight sm:text-xl">
              {config.headline}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{config.subheadline}</p>

            <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-foreground/80">
              <span className="font-medium text-primary">Combo aplicado: </span>
              {config.combinedBenefit}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-display text-lg font-bold text-foreground">
                  {formatBRL(target.price)}
                </span>{" "}
                · {target.workload_hours}h
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link
                  to="/curso/$slug/oferta"
                  params={{ slug: target.slug }}
                  search={{ ref: "upsell" }}
                >
                  {config.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
              >
                Agora não
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
