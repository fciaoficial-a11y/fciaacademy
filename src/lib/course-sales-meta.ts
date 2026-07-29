/**
 * Metadados comerciais por curso — usados na vitrine (/cursos e home)
 * para gerar hierarquia visual, selos de status e ancoragem de preço.
 *
 * A vitrine consome este mapa por slug. Se um curso não estiver listado
 * aqui, a vitrine cai para o layout padrão (sem selo, sem preço original).
 */

export type CourseBadgeKind =
  | "bestseller"
  | "new"
  | "featured"
  | "open"
  | "limited";

export type CourseSalesMeta = {
  /** Selo principal exibido sobre a capa. */
  badge?: { kind: CourseBadgeKind; label: string };
  /** Preço original (âncora) — se maior que o preço atual, renderiza riscado. */
  originalPrice?: number;
  /** Frase curta orientada a venda (substitui description longa no card). */
  hook?: string;
  /** Chamada final do CTA do card. */
  ctaLabel?: string;
  /**
   * Prioridade de destaque: 0 = card hero (span 2 colunas em md+),
   * 1 = card destacado, undefined = card padrão.
   */
  featurePriority?: 0 | 1;
};

export const COURSE_SALES_META: Record<string, CourseSalesMeta> = {
  "metodo-ia-criativa": {
    badge: { kind: "bestseller", label: "Best Seller · Masterclass" },
    originalPrice: 749.9,
    hook: "O método aplicado que transforma IA em criação, presença e vendas — masterclass completa em 10 aulas.",
    ctaLabel: "Quero a masterclass",
    featurePriority: 0,
  },
  "ia-sem-misterio": {
    badge: { kind: "open", label: "Turma inaugural aberta" },
    originalPrice: 297,
    hook: "Domine IA no ritmo real de quem trabalha — prompts prontos, aplicação imediata, certificado reconhecido.",
    ctaLabel: "Começar agora",
  },
  "venda-com-ia": {
    badge: { kind: "new", label: "Novo · Acelerador Comercial" },
    originalPrice: 89.9,
    hook: "IA aplicada a vendas: prospecção, objeções, follow-up e fechamento com prompts prontos.",
    ctaLabel: "Quero vender com IA",
  },
};

export function getCourseSalesMeta(slug: string): CourseSalesMeta {
  return COURSE_SALES_META[slug] ?? {};
}

const BADGE_STYLES: Record<CourseBadgeKind, string> = {
  bestseller:
    "border-amber-400/40 bg-gradient-to-r from-amber-400/95 to-orange-500/95 text-black shadow-[0_8px_24px_-8px_rgba(251,191,36,0.6)]",
  new:
    "border-emerald-400/40 bg-emerald-500/95 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]",
  featured:
    "border-primary/40 bg-primary/95 text-primary-foreground shadow-[0_8px_24px_-8px_rgba(59,130,246,0.6)]",
  open:
    "border-cyan-400/40 bg-cyan-500/95 text-white shadow-[0_8px_24px_-8px_rgba(34,211,238,0.6)]",
  limited:
    "border-rose-400/40 bg-rose-500/95 text-white shadow-[0_8px_24px_-8px_rgba(244,63,94,0.6)]",
};

export function badgeClass(kind: CourseBadgeKind): string {
  return BADGE_STYLES[kind];
}

/** Formata número em BRL sem 'R$' — o rótulo é escrito no JSX para permitir estilos. */
export function formatBRL(value: number): string {
  return value.toFixed(2).replace(".", ",");
}
