/**
 * Sistema de variantes A/B para /curso/:slug/oferta.
 *
 * Regras de design:
 * - Layout-base NÃO muda. Apenas texto e formato de ancoragem de preço.
 * - Cada variante é um objeto plano, fácil de editar sem refatorar componentes.
 * - Seleção da variante:
 *     1. Parâmetro de URL ?v=A|B|C (prioridade máxima, útil para testes manuais)
 *     2. Chave persistida em localStorage por slug (mantém a mesma variante para
 *        o mesmo usuário entre visitas)
 *     3. Sorteio determinístico por slug (fallback estável)
 * - Para promover uma variante como default, edite `OFFER_VARIANT_WEIGHTS`.
 */

export type OfferVariantKey = "A" | "B" | "C";

/** Modo de ancoragem de preço exibido no bloco de oferta e CTA final. */
export type PriceAnchorMode =
  | "single" // "pagamento único via PIX"
  | "perDay" // "menos de R$X por dia"
  | "compare" // "De R$Y por R$X"
  | "combined"; // combina compare + perDay

export interface OfferVariant {
  key: OfferVariantKey;
  /** Rótulo do botão principal (hero, oferta, CTA final). */
  primaryCta: string;
  /** Rótulo do CTA sticky mobile (versão curta). */
  primaryCtaShort: string;
  /** Headline principal do hero. Se null, usa `course.title`. */
  heroHeadline: string | null;
  /** Subheadline com promessa de transformação. Se null, usa `course.description`. */
  heroSubheadline: string | null;
  /** Selo/eyebrow acima do headline no hero. */
  heroEyebrow: string;
  /** Título do bloco de investimento/oferta. */
  offerTitle: string;
  /** Modo de ancoragem de preço. */
  priceAnchor: PriceAnchorMode;
  /** Headline do CTA final da página. */
  finalCtaHeadline: string;
}

export const OFFER_VARIANTS: Record<OfferVariantKey, OfferVariant> = {
  A: {
    key: "A",
    primaryCta: "Garantir vaga",
    primaryCtaShort: "Garantir vaga",
    heroHeadline: null,
    heroSubheadline: null,
    heroEyebrow: "Oferta oficial FCIA",
    offerTitle: "Investimento único, acesso vitalício",
    priceAnchor: "combined",
    finalCtaHeadline: "Dê o próximo passo agora",
  },
  B: {
    key: "B",
    primaryCta: "Começar agora",
    primaryCtaShort: "Começar agora",
    heroHeadline: null,
    heroSubheadline:
      "Aprenda o método aplicado que Fernando Cabral usa em consultorias reais — no seu ritmo, com certificado reconhecido.",
    heroEyebrow: "Turma aberta · Vagas limitadas",
    offerTitle: "Menos que um café por dia",
    priceAnchor: "perDay",
    finalCtaHeadline: "Comece hoje. Domine amanhã.",
  },
  C: {
    key: "C",
    primaryCta: "Acessar agora",
    primaryCtaShort: "Acessar agora",
    heroHeadline: null,
    heroSubheadline:
      "Transforme sua rotina em resultado com IA — método aplicado, sem enrolação, sem código.",
    heroEyebrow: "Método FCIA · Aplicado ao seu dia a dia",
    offerTitle: "Um investimento, todos os benefícios",
    priceAnchor: "single",
    finalCtaHeadline: "Sua próxima habilidade começa aqui",
  },
};

/**
 * Peso relativo de cada variante no sorteio determinístico.
 * Ajuste aqui para promover uma variante sem tocar em componentes.
 */
export const OFFER_VARIANT_WEIGHTS: Record<OfferVariantKey, number> = {
  A: 1,
  B: 1,
  C: 1,
};

const STORAGE_KEY = "fcia:offer-variant";

function hashSlug(slug: string): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) + h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickWeighted(slug: string): OfferVariantKey {
  const total = Object.values(OFFER_VARIANT_WEIGHTS).reduce((a, b) => a + b, 0);
  const roll = hashSlug(slug) % total;
  let acc = 0;
  for (const key of Object.keys(OFFER_VARIANT_WEIGHTS) as OfferVariantKey[]) {
    acc += OFFER_VARIANT_WEIGHTS[key];
    if (roll < acc) return key;
  }
  return "A";
}

function isValidKey(v: unknown): v is OfferVariantKey {
  return v === "A" || v === "B" || v === "C";
}

/**
 * Resolve a variante ativa para um slug. Puro; sem side effects.
 * @param slug slug do curso
 * @param override opcional (vindo de URL search param `?v=`)
 */
export function resolveOfferVariant(
  slug: string,
  override?: string | null,
): OfferVariant {
  if (isValidKey(override)) return OFFER_VARIANTS[override];

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_KEY}:${slug}`);
      if (isValidKey(stored)) return OFFER_VARIANTS[stored];
    } catch {
      /* ignore storage errors */
    }
  }

  const picked = pickWeighted(slug);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:${slug}`, picked);
    } catch {
      /* ignore */
    }
  }

  return OFFER_VARIANTS[picked];
}

/**
 * Formata o texto de ancoragem de preço para uma variante.
 * Mantém tipografia/layout no componente; retorna apenas conteúdo textual.
 */
export interface PriceAnchorContent {
  strike: string | null; // ex.: "De R$797,00"
  primary: string; // ex.: "R$497,00"
  supporting: Array<string>; // linhas complementares abaixo do preço principal
}

export function buildPriceAnchor(
  variant: OfferVariant,
  values: { price: number; anchorPrice: number; installment12: number; perDay: number },
  formatBRL: (n: number) => string,
): PriceAnchorContent {
  const { price, anchorPrice, installment12, perDay } = values;

  switch (variant.priceAnchor) {
    case "single":
      return {
        strike: null,
        primary: formatBRL(price),
        supporting: [
          "Pagamento único via PIX · sem mensalidade, sem renovação.",
          "Acesso liberado em segundos após a confirmação.",
        ],
      };
    case "perDay":
      return {
        strike: null,
        primary: formatBRL(price),
        supporting: [
          `Menos de ${formatBRL(perDay)} por dia em 1 ano de acesso.`,
          "Pagamento único via PIX · sem mensalidade.",
        ],
      };
    case "compare":
      return {
        strike: `De ${formatBRL(anchorPrice)}`,
        primary: formatBRL(price),
        supporting: [
          `Economize ${formatBRL(anchorPrice - price)} nesta oferta de lançamento.`,
          "Pagamento único via PIX.",
        ],
      };
    case "combined":
    default:
      return {
        strike: `De ${formatBRL(anchorPrice)}`,
        primary: formatBRL(price),
        supporting: [
          `Equivale a ${formatBRL(perDay)} por dia em 1 ano de acesso.`,
          "Pagamento único via PIX · sem mensalidade.",
        ],
      };
  }
}
