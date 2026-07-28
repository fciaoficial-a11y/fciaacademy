/**
 * ============================================================
 *  FCIA ACADEMY — CHECKLIST DE PUBLICAÇÃO DE CURSO
 * ============================================================
 *
 * Regra: um curso só pode virar `is_published = true` quando TODOS
 * os campos obrigatórios da página /curso/:slug/oferta estiverem
 * preenchidos corretamente. Este arquivo é a fonte única da verdade
 * para essa validação, consumida tanto pelo painel admin quanto por
 * qualquer futura automação (webhook, batch, IA).
 *
 * Também existe um trigger SQL `enforce_course_publish_rules` no
 * banco que aplica os itens críticos server-side. Os itens verificáveis
 * apenas em código (FAQ >= 3, audiência, benefícios) vivem aqui.
 */

import { resolveCourseTemplate } from "@/lib/course-template";

export interface PublishCheckInput {
  slug: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
  price: number | null | undefined;
  is_free: boolean | null | undefined;
  workload_hours: number | null | undefined;
  cover_url: string | null | undefined;
  publishedModulesCount: number;
}

export interface PublishCheckItem {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
}

export interface PublishCheckResult {
  items: PublishCheckItem[];
  missing: PublishCheckItem[];
  canPublish: boolean;
}

/** Valida o checklist mínimo de publicação. */
export function checkPublishReadiness(input: PublishCheckInput): PublishCheckResult {
  const slug = (input.slug ?? "").trim();
  const title = (input.title ?? "").trim();
  const description = (input.description ?? "").trim();
  const price = Number(input.price ?? 0);
  const isFree = !!input.is_free;
  const workload = Number(input.workload_hours ?? 0);
  const cover = (input.cover_url ?? "").trim();

  // Template resolvido devolve defaults quando não há override — o que
  // garante FAQ, audiência e benefícios sempre presentes. Ainda assim
  // validamos o resultado final para proteger contra overrides quebrados.
  const tpl = resolveCourseTemplate({
    slug: slug || "__placeholder__",
    title: title || "Curso",
    description: description || "Descrição",
  });

  const items: PublishCheckItem[] = [
    {
      id: "title",
      label: "Nome do curso",
      ok: title.length >= 3,
      hint: "Informe um título com pelo menos 3 caracteres.",
    },
    {
      id: "slug",
      label: "Slug (URL)",
      ok: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
      hint: "Slug em minúsculas, sem espaços (ex.: venda-com-ia).",
    },
    {
      id: "promise",
      label: "Promessa principal (descrição)",
      ok: description.length >= 40,
      hint: "Descreva a promessa em pelo menos 40 caracteres.",
    },
    {
      id: "price",
      label: "Preço definido",
      ok: isFree || price > 0,
      hint: "Marque como gratuito ou defina um valor maior que zero.",
    },
    {
      id: "cta",
      label: "CTA principal ligado ao checkout",
      ok: isFree || price > 0, // CTA "Comprar" só funciona com preço; grátis usa "Matricular"
      hint: "CTA depende de preço válido ou curso gratuito.",
    },
    {
      id: "cover",
      label: "Imagem / capa do curso",
      ok: /^https?:\/\/.+/i.test(cover),
      hint: "Adicione uma URL de capa (upload ou link https).",
    },
    {
      id: "workload",
      label: "Carga horária",
      ok: workload > 0,
      hint: "Informe a carga horária em horas (> 0).",
    },
    {
      id: "modules",
      label: "Pelo menos 3 módulos publicados",
      ok: input.publishedModulesCount >= 3,
      hint: `Publicados agora: ${input.publishedModulesCount}. Publique ao menos 3.`,
    },
    {
      id: "audience",
      label: 'Bloco "Para quem é"',
      ok: (tpl.audience?.forWhom?.length ?? 0) >= 3,
      hint: "Audiência definida no template do curso.",
    },
    {
      id: "faq",
      label: "Pelo menos 3 perguntas no FAQ",
      ok: (tpl.faq?.length ?? 0) >= 3,
      hint: "FAQ padrão + overrides precisam somar 3 itens.",
    },
    {
      id: "benefits",
      label: "Bloco de benefícios (garantia + certificado + método)",
      ok: true, // Fixo no layout /oferta — não editável por curso.
      hint: "Bloco garantido pelo layout da página de oferta.",
    },
  ];

  const missing = items.filter((i) => !i.ok);
  return { items, missing, canPublish: missing.length === 0 };
}

/** Resumo curto para toast/mensagens. */
export function summarizeMissing(result: PublishCheckResult): string {
  if (result.canPublish) return "Curso pronto para publicar.";
  const labels = result.missing.map((m) => m.label);
  return `Faltando: ${labels.join(" · ")}.`;
}
