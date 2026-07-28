/**
 * ============================================================
 *  FCIA ACADEMY — TEMPLATE REUTILIZÁVEL DE CURSO
 * ============================================================
 *
 * Este arquivo é o ÚNICO ponto de configuração editorial por curso.
 * O layout, ordem das seções, sticky CTA, garantia, selos de segurança
 * e fluxo de compra são fixos (componente `src/routes/curso.$slug.oferta.tsx`).
 *
 * Para publicar um novo curso:
 *  1. Criar o curso no banco (tabela `courses`) com slug único, título,
 *     descrição curta, workload_hours, price e cover_url. Popular `modules`.
 *  2. (Opcional) Adicionar uma entrada em `COURSE_TEMPLATE_OVERRIDES` abaixo
 *     usando o mesmo `slug` do banco para customizar copy de vendas
 *     (audiência, depoimentos, FAQ, promessa do herói).
 *  3. Se nenhuma entrada existir, o curso é publicado automaticamente com
 *     copy padrão. Nada quebra. Basta `is_published = true` no banco.
 *
 * Regras invioláveis (mantidas pelo layout, não editáveis por curso):
 *  - Rota `/curso/:slug/oferta` = página pública de vendas.
 *  - Rota `/curso/:slug` = área do aluno (só após compra).
 *  - Home, catálogo e sticky CTA apontam SEMPRE para `/oferta`.
 *  - Garantia 7 dias + selo Asaas/PIX aparecem junto de todo CTA.
 *  - Ordem das seções é fixa: hero → prova social → oferta → checkout →
 *    audiência → módulos → certificado → depoimentos → FAQ → CTA final.
 */

export interface CourseAudienceCopy {
  forWhom: string[];
  notForWhom: string[];
}

export interface CourseTestimonial {
  name: string;
  role: string;
  initials: string;
  result: string;
  quote: string;
  photoUrl?: string | null;
}

export interface CourseFaqItem {
  q: string;
  /** Aceita `{price}`, `{perDay}` e `{workload}` como placeholders. */
  a: string;
}

export interface CourseHeroOverride {
  /** Chip pequeno acima do título. Default: "Curso oficial FCIA". */
  eyebrow?: string;
  /** Se ausente, usa `course.title`. */
  headline?: string;
  /** Se ausente, usa `course.description`. */
  subheadline?: string;
  /** Frase curta do professor no card de autoridade. */
  professorQuote?: string;
}

export interface CourseTemplateOverride {
  hero?: CourseHeroOverride;
  audience?: CourseAudienceCopy;
  testimonials?: CourseTestimonial[];
  /** Adiciona (ou substitui) perguntas ao FAQ base. */
  faq?: CourseFaqItem[];
  /** Substitui totalmente o FAQ ao invés de mesclar. */
  faqReplace?: boolean;
}

// ==================================================================
//  OVERRIDES POR CURSO — editável livremente
// ==================================================================

export const COURSE_TEMPLATE_OVERRIDES: Record<string, CourseTemplateOverride> = {
  "ia-sem-misterio": {
    hero: {
      eyebrow: "Curso oficial FCIA · Turma inaugural",
      professorQuote:
        "Aprendi na prática o que ninguém ensina no curso comum. Aqui eu entrego atalho.",
    },
    audience: {
      forWhom: [
        "Profissionais que veem colegas usando IA e sentem que estão ficando para trás",
        "Gestores e líderes que precisam decidir sobre IA na empresa sem depender do TI",
        "Autônomos e liberais (advogados, contadores, consultores) que querem economizar horas por semana em tarefas repetitivas",
        "Quem já testou ChatGPT solto, se frustrou com respostas rasas e quer um método estruturado",
      ],
      notForWhom: [
        "Desenvolvedores buscando treinar modelos, fine-tuning ou fundamentos matemáticos de IA",
        "Quem procura curso 100% teórico ou acadêmico sobre history/pesquisa de IA",
        "Quem espera fórmula mágica de enriquecimento rápido usando IA",
        "Quem não pretende dedicar ao menos 2 horas por semana para aplicar o que aprender",
      ],
    },
    testimonials: [
      {
        name: "Ricardo M.",
        role: "Gerente comercial · indústria",
        initials: "RM",
        result: "Economizou 6h/semana em relatórios",
        quote:
          "Eu abria o ChatGPT e não sabia o que pedir. Saí do curso com prompts prontos para relatório gerencial, e-mail difícil e ata de reunião. Meu chefe achou que contratei um assistente.",
      },
      {
        name: "Juliana P.",
        role: "Advogada tributarista",
        initials: "JP",
        result: "Petições em 1/3 do tempo",
        quote:
          "Passei anos com medo de a IA me substituir. O Fernando mostrou o contrário: virei a advogada que resolve mais casos por semana. A IA revisa e organiza — eu decido.",
      },
      {
        name: "Diego A.",
        role: "Diretor de operações",
        initials: "DA",
        result: "Time inteiro usando IA em 30 dias",
        quote:
          "Eu precisava explicar IA para a diretoria sem parecer amador. O curso me deu vocabulário, exemplos práticos e um plano de rollout. Levei a IA para dentro da empresa com segurança.",
      },
    ],
  },

  "venda-com-ia": {
    hero: {
      eyebrow: "Curso oficial FCIA · Acelerador comercial",
      professorQuote:
        "Vender com IA não é sobre spam automático. É sobre chegar antes, personalizar melhor e fechar mais.",
    },
    audience: {
      forWhom: [
        "Vendedores e SDRs que perdem horas escrevendo prospecção fria e follow-up manual",
        "Donos de pequeno negócio que fazem a própria venda e não têm tempo para prospectar",
        "Consultores e freelancers que precisam de fluxo constante de leads qualificados",
        "Gerentes comerciais que querem padronizar abordagem do time usando IA",
      ],
      notForWhom: [
        "Quem quer aprender teoria de vendas complexas B2B enterprise (ciclo longo, comitê de compra)",
        "Quem procura curso de tráfego pago, anúncios ou funil de marketing digital",
        "Quem não vende nada e não pretende começar a vender nos próximos 90 dias",
        "Quem espera que a IA venda sozinha, sem envolvimento humano na conversa",
      ],
    },
    testimonials: [
      {
        name: "Camila R.",
        role: "SDR · SaaS B2B",
        initials: "CR",
        result: "3x mais reuniões agendadas",
        quote:
          "Copiava e colava o mesmo template para todo mundo. Agora personalizo cada abordagem em 40 segundos com IA e o lead responde. Bati meta trimestral em 5 semanas.",
      },
      {
        name: "Anderson L.",
        role: "Dono de estúdio de design",
        initials: "AL",
        result: "Fechou 4 clientes em 30 dias",
        quote:
          "Eu odiava prospectar. Achava que era chato e invasivo. O método do Fernando me deu abordagem consultiva com IA — parece conversa, não venda. Meu funil nunca esteve tão cheio.",
      },
      {
        name: "Patrícia S.",
        role: "Consultora financeira autônoma",
        initials: "PS",
        result: "Follow-up automático que fecha",
        quote:
          "Perdia venda no follow-up porque esquecia de responder no tempo certo. Montei minha esteira com IA e mensagens prontas por contexto. Duas semanas depois, fechei três contratos parados há meses.",
      },
    ],
  },
};

// ==================================================================
//  DEFAULTS — usados quando o curso não tem override próprio
// ==================================================================

const DEFAULT_AUDIENCE: CourseAudienceCopy = {
  forWhom: [
    "Profissionais que querem aplicar IA no dia a dia sem enrolação técnica",
    "Empreendedores e gestores buscando ganho real de produtividade",
    "Quem já tentou aprender sozinho e se perdeu em ferramentas soltas",
    "Executivos que precisam falar de IA com propriedade",
  ],
  notForWhom: [
    "Quem busca curso teórico e acadêmico",
    "Quem quer aprender a treinar modelos do zero em Python",
    "Quem procura conteúdo gratuito ou promessa mágica",
    "Quem não pretende aplicar nada do que aprender",
  ],
};

const DEFAULT_TESTIMONIALS: CourseTestimonial[] = [
  {
    name: "Aluno FCIA — em breve",
    role: "Depoimento em produção",
    initials: "FC",
    result: "Resultado em construção",
    quote:
      "Espaço reservado para depoimento real da primeira turma. Este bloco é editável e será substituído por relato verificado ao final do primeiro ciclo.",
  },
  {
    name: "Aluno FCIA — em breve",
    role: "Depoimento em produção",
    initials: "FC",
    result: "Resultado em construção",
    quote:
      "Aqui entra a fala de um aluno destacando o resultado alcançado após aplicar o método na rotina profissional.",
  },
  {
    name: "Aluno FCIA — em breve",
    role: "Depoimento em produção",
    initials: "FC",
    result: "Resultado em construção",
    quote:
      "Espaço reservado para depoimento sobre a aplicação prática do curso no trabalho ou negócio do aluno.",
  },
];

/**
 * FAQ base aplicado a TODO curso. Cursos podem adicionar perguntas
 * específicas via `faq: [...]` no override, ou substituir tudo com
 * `faqReplace: true`.
 *
 * Placeholders suportados em `a`:
 *  - `{price}`     preço formatado em BRL
 *  - `{perDay}`    custo/dia em 1 ano
 *  - `{workload}`  carga horária ("60h")
 */
const DEFAULT_FAQ: CourseFaqItem[] = [
  {
    q: "Vale {price}?",
    a: "O curso reúne o método que Fernando Cabral aplica em consultorias reais. Você paga uma vez e usa o conteúdo por tempo indeterminado — o custo por dia ao longo de 1 ano é de {perDay}.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "Acesso vitalício ao conteúdo publicado neste curso, com atualizações incluídas quando lançarmos novas aulas dentro deste mesmo produto.",
  },
  {
    q: "Tem suporte?",
    a: "Sim. Você pode enviar dúvidas pelo canal oficial da FCIA (WhatsApp e e-mail de suporte). Respondemos em dias úteis.",
  },
  {
    q: "Emite certificado?",
    a: "Sim. Ao concluir 100% dos módulos obrigatórios e atingir 70% no exame final, o certificado é emitido automaticamente com código de validação público (Lei 9.394/96 · Decreto 5.154/04).",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias corridos de garantia incondicional. Se decidir que não é para você, pedimos o cancelamento e devolvemos 100% do valor pago — sem burocracia.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "O pagamento é feito via PIX, processado pela Asaas, regulado pelo Banco Central. A confirmação e liberação do acesso é automática assim que o banco confirma o PIX.",
  },
];

const DEFAULT_HERO: Required<CourseHeroOverride> = {
  eyebrow: "Curso oficial FCIA Academy",
  headline: "",
  subheadline: "",
  professorQuote:
    "Método aplicado. Aula que resolve. Certificado com validade legal.",
};

// ==================================================================
//  RESOLVER — devolve a config final que a página de oferta consome
// ==================================================================

export interface ResolvedCourseTemplate {
  hero: Required<CourseHeroOverride>;
  audience: CourseAudienceCopy;
  testimonials: CourseTestimonial[];
  faq: CourseFaqItem[];
}

interface ResolveArgs {
  slug: string;
  title: string;
  description: string;
}

export function resolveCourseTemplate({
  slug,
  title,
  description,
}: ResolveArgs): ResolvedCourseTemplate {
  const override = COURSE_TEMPLATE_OVERRIDES[slug] ?? {};

  const hero: Required<CourseHeroOverride> = {
    eyebrow: override.hero?.eyebrow ?? DEFAULT_HERO.eyebrow,
    headline: override.hero?.headline ?? title,
    subheadline: override.hero?.subheadline ?? description,
    professorQuote: override.hero?.professorQuote ?? DEFAULT_HERO.professorQuote,
  };

  const faq = override.faqReplace
    ? override.faq ?? DEFAULT_FAQ
    : [...DEFAULT_FAQ, ...(override.faq ?? [])];

  return {
    hero,
    audience: override.audience ?? DEFAULT_AUDIENCE,
    testimonials: override.testimonials ?? DEFAULT_TESTIMONIALS,
    faq,
  };
}

/**
 * Interpola placeholders `{price}`, `{perDay}`, `{workload}` em uma string
 * de FAQ. Chamado pela página de oferta com os valores calculados a partir
 * do curso corrente.
 */
export function fillFaqPlaceholders(
  text: string,
  vars: { price: string; perDay: string; workload: string },
): string {
  return text
    .replaceAll("{price}", vars.price)
    .replaceAll("{perDay}", vars.perDay)
    .replaceAll("{workload}", vars.workload);
}
