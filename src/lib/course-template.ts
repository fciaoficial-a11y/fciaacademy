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

/**
 * Blocos editoriais OPCIONAIS. Quando presentes, a página de oferta
 * renderiza a seção correspondente. Ausência = seção não aparece.
 */
export interface CoursePainCopy {
  title: string;
  intro: string;
  bullets: string[];
  transition?: string;
}
export interface CourseMethodPillar { name: string; description: string }
export interface CourseMethodIntegrationItem { label: string; description: string }
export interface CourseMethodCopy {
  title: string;
  intro: string;
  pillars: CourseMethodPillar[];
  integrationTitle?: string;
  integrationItems?: CourseMethodIntegrationItem[];
  differentiator?: string;
  transition?: string;
}
export interface CourseTransformationPair { before: string; after: string }
export interface CourseTransformationCopy {
  title: string;
  intro: string;
  pairs: CourseTransformationPair[];
  synthesis?: string;
  transition?: string;
}
export interface CourseBonus {
  name: string;
  value: string;
  purpose: string;
  description?: string;
}
export interface CourseBonusesCopy {
  title: string;
  intro: string;
  bonuses: CourseBonus[];
  totalLabel?: string;
  closing?: string;
}

export interface CourseValueStackItem {
  label: string;
  value: string;
  note?: string;
}
export interface CourseValueStackCopy {
  title: string;
  intro: string;
  items: CourseValueStackItem[];
  totalLabel: string;
  transition: string;
  priceHighlight: string;
  priceCaption: string;
  riskNote: string;
  ctaLabel: string;
  closing: string;
}

export interface CourseAuthorityPoint {
  title: string;
  description: string;
}
export interface CourseAuthorityCopy {
  eyebrow: string;
  title: string;
  intro: string;
  points: CourseAuthorityPoint[];
  instructorName: string;
  instructorRole: string;
  instructorBio: string;
  transition: string;
}

export interface CourseTemplateOverride {
  hero?: CourseHeroOverride;
  audience?: CourseAudienceCopy;
  testimonials?: CourseTestimonial[];
  /** Adiciona (ou substitui) perguntas ao FAQ base. */
  faq?: CourseFaqItem[];
  /** Substitui totalmente o FAQ ao invés de mesclar. */
  faqReplace?: boolean;
  pain?: CoursePainCopy;
  method?: CourseMethodCopy;
  transformation?: CourseTransformationCopy;
  bonuses?: CourseBonusesCopy;
  valueStack?: CourseValueStackCopy;
  authority?: CourseAuthorityCopy;
}


// ==================================================================
//  OVERRIDES POR CURSO — editável livremente
// ==================================================================

export const COURSE_TEMPLATE_OVERRIDES: Record<string, CourseTemplateOverride> = {
  "metodo-ia-criativa": {
    hero: {
      eyebrow: "Masterclass FCIA · Produto principal",
      headline:
        "Crie imagem, vídeo, música e roteiro com IA em nível profissional — sem cara de robô, sem tutorial solto.",
      subheadline:
        "A masterclass da FCIA Academy que te leva do zero à peça pronta para publicar, vender ou entregar ao cliente — com método aplicado às quatro mídias, não a uma ferramenta isolada.",
      professorQuote:
        "Ferramenta muda toda semana. Método, não. Aqui você aprende o processo que continua funcionando quando a próxima IA aparecer.",
    },
    audience: {
      forWhom: [
        "Criadores de conteúdo que querem produzir mais rápido, sem perder padrão visual",
        "Social medias e freelancers que precisam entregar peças coerentes para clientes exigentes",
        "Empreendedores e donos de negócio que produzem o próprio marketing e não têm tempo a perder",
        "Marketers e produtores que querem integrar imagem, vídeo, áudio e roteiro num fluxo único",
      ],
      notForWhom: [
        "Quem procura tutorial solto de uma única ferramenta específica",
        "Quem quer aprender programação, fine-tuning ou fundamentos matemáticos de IA",
        "Quem espera resultado profissional sem aplicar o método nas próprias peças",
        "Quem não pretende publicar, vender ou entregar nada nos próximos 30 dias",
      ],
    },
    pain: {
      title:
        "Você gera, apaga, tenta de novo — e publica algo que não te representa.",
      intro:
        "A IA prometeu acelerar sua criação. Virou mais uma aba aberta. Ferramenta demais, método nenhum. E o resultado sai com cara de IA, não a sua cara.",
      bullets: [
        "Gera dez versões e nenhuma boa o bastante para publicar",
        "Trava no prompt e o resultado nunca chega perto do que estava na cabeça",
        "Imagem, vídeo, música e roteiro que não conversam entre si",
        "Corre atrás da próxima ferramenta sem dominar nenhuma de verdade",
        "Publica com insegurança porque a peça tem cara de IA",
      ],
      transition:
        "Não é falta de talento. É falta de método. E é isso que a masterclass corrige.",
    },
    method: {
      title: "O problema nunca foi a ferramenta. Era a falta de método.",
      intro:
        "Quem entrega resultado com IA não corre atrás de ferramenta — trabalha dentro de um processo. Ferramenta muda toda semana. Método, não.",
      pillars: [
        {
          name: "Criar",
          description:
            "Sistema fixo para transformar ideia em peça, sem depender do prompt certo aparecer por sorte.",
        },
        {
          name: "Encantar",
          description:
            "Padrão visual, ritmo e intenção. O que separa o amador do profissional.",
        },
        {
          name: "Vender",
          description:
            "Portfólio, oferta ou entrega ao cliente. Método sem monetização é hobby caro.",
        },
      ],
      integrationTitle: "Quatro mídias, uma língua",
      integrationItems: [
        { label: "Imagem", description: "Ancora conceito e identidade visual." },
        { label: "Vídeo", description: "Dá movimento e emoção à narrativa." },
        { label: "Música", description: "Fixa emoção e memória na peça." },
        { label: "Roteiro", description: "Estrutura a mensagem e sustenta tudo." },
      ],
      differentiator:
        "Tutorial ensina botão. Curso genérico ensina ferramenta. A masterclass ensina processo.",
      transition:
        "A diferença aparece rápido — no antes e depois de quem passa a criar com método.",
    },
    transformation: {
      title:
        "A diferença entre usar IA e dominar IA aparece na primeira peça que você entrega.",
      intro:
        "Sai o improviso de gerar no escuro. Entra um processo em que cada peça nasce com intenção e coerência entre as quatro mídias.",
      pairs: [
        { before: "Dez versões torcendo para uma servir", after: "Primeira versão já com padrão profissional" },
        { before: "Prompt genérico copiado do YouTube", after: "Prompt autoral, calibrado ao objetivo" },
        { before: "Imagem, vídeo, áudio e roteiro desalinhados", after: "As quatro mídias falam a mesma língua" },
        { before: "Peça com cara de IA", after: "Peça com identidade própria" },
        { before: "Publicava com insegurança", after: "Publica com clareza e intenção" },
        { before: "Dependia da próxima ferramenta da moda", after: "Método que sobrevive às mudanças" },
      ],
      synthesis:
        "Você para de testar IA e começa a produzir com IA — no padrão de quem cobra para entregar.",
      transition:
        "Essa transformação é construída aula por aula, dentro da estrutura da masterclass.",
    },
    bonuses: {
      title:
        "Você não sai só com a masterclass. Sai com o kit completo para acelerar cada etapa.",
      intro:
        "Bônus que encurtam o caminho entre aprender e entregar. Cada um resolve uma fricção real de quem produz com IA.",
      bonuses: [
        {
          name: "Biblioteca de Prompts Mestres",
          value: "R$ 197",
          purpose: "Ponto de partida testado para as quatro mídias.",
          description:
            "Prompts prontos, categorizados por mídia e objetivo, para começar cada peça de um lugar profissional.",
        },
        {
          name: "Painel de Referências Visuais",
          value: "R$ 147",
          purpose: "Direção estética pronta para peças com padrão.",
          description:
            "Curadoria por estilo e mood — chega de perder tempo garimpando referência solta.",
        },
        {
          name: "Guia de Integração das 4 Mídias",
          value: "R$ 197",
          purpose: "Fluxo passo a passo para peças coerentes ponta a ponta.",
          description:
            "Como fazer imagem, vídeo, áudio e roteiro nascerem da mesma direção — onde a maioria trava.",
        },
        {
          name: "Kit de Monetização Criativa",
          value: "R$ 197",
          purpose: "Do portfólio ao primeiro cliente pagante.",
          description:
            "Como estruturar entrega, precificar, propor e fechar — transformar método em receita.",
        },
      ],
      totalLabel: "R$ 738 em bônus",
      closing:
        "O stack de bônus soma R$ 738. Junto da masterclass, forma o pacote completo da FCIA Academy.",
    },
    valueStack: {
      title: "Uma masterclass. Um pagamento. Acesso completo ao método.",
      intro:
        "Antes do preço, olhe o que entra no pacote. A masterclass sozinha já se paga na primeira peça entregue com padrão profissional. Os bônus existem para você chegar lá mais rápido.",
      items: [
        { label: "Masterclass Método IA Criativa (acesso vitalício)", value: "R$ 997" },
        { label: "Biblioteca de Prompts Mestres", value: "R$ 197" },
        { label: "Painel de Referências Visuais", value: "R$ 147" },
        { label: "Guia de Integração das 4 Mídias", value: "R$ 197" },
        { label: "Kit de Monetização Criativa", value: "R$ 197" },
        { label: "Certificado digital reconhecido", value: "incluso" },
      ],
      totalLabel: "Valor real do pacote: R$ 1.735",
      transition:
        "Você não paga R$ 1.735. Nem R$ 997. Enquanto a turma inaugural estiver aberta, o acesso completo sai por:",
      priceHighlight: "R$ 249,90",
      priceCaption: "uma única vez · via PIX · sem mensalidade, sem renovação",
      riskNote:
        "Acesso liberado em segundos após a confirmação do PIX · Garantia incondicional de 7 dias",
      ctaLabel: "Garantir minha vaga por PIX — R$ 249,90",
      closing:
        "R$ 1.735 em conteúdo e bônus. R$ 249,90 uma única vez. A decisão que separa quem testa IA de quem entrega com IA cabe em um PIX.",
    },

    authority: {
      eyebrow: "Por que confiar na FCIA Academy",
      title: "Autoridade construída por método, curadoria e aplicação real.",
      intro:
        "A FCIA Academy não é um marketplace de aulas soltas. Cada masterclass é desenhada como um método aplicado — testado em produção antes de virar aula — e conduzida por um instrutor que vive de entregar com IA, não apenas de falar sobre ela.",
      points: [
        {
          title: "Método aplicado, não teoria solta",
          description:
            "Cada aula existe para produzir uma entrega — imagem, vídeo, áudio ou roteiro em nível profissional.",
        },
        {
          title: "Foco em resultado comercial",
          description:
            "A curadoria prioriza o que gera peça vendável, portfólio real e receita — não experimentos aleatórios.",
        },
        {
          title: "Certificado com validade legal",
          description:
            "Emitido pela FCIA Academy sob a Lei 9.394/96, com código público de verificação.",
        },
        {
          title: "Comunidade viva no Telegram",
          description:
            "Canal ativo para trocar prompts, referências e destravar bloqueios com quem também aplica o método.",
        },
        {
          title: "Curadoria continuamente atualizada",
          description:
            "As ferramentas de IA mudam rápido. O método é revisto para manter o que funciona hoje, não o que funcionava mês passado.",
        },
      ],
      instructorName: "Instrutor FCIA Academy",
      instructorRole: "Curador e instrutor responsável pela masterclass",
      instructorBio:
        "Atua na aplicação prática de IA à produção criativa e comercial — imagem, vídeo, áudio e roteiro. A masterclass reproduz o mesmo método usado em entregas reais: direto, aplicado e com padrão profissional.",
      transition:
        "Autoridade é o que garante que o método funciona. A seguir, o que dizem quem já aplicou.",
    },

    testimonials: [
      {
        name: "Beta interno — em produção",
        role: "Depoimento em construção",
        initials: "FC",
        result: "Primeira turma",
        quote:
          "Depoimentos reais da turma inaugural serão publicados aqui após o primeiro ciclo de aplicação do método.",
      },
      {
        name: "Beta interno — em produção",
        role: "Depoimento em construção",
        initials: "FC",
        result: "Primeira turma",
        quote:
          "Espaço reservado para relato verificado de aluno da masterclass sobre integração das quatro mídias.",
      },
      {
        name: "Beta interno — em produção",
        role: "Depoimento em construção",
        initials: "FC",
        result: "Primeira turma",
        quote:
          "Depoimento sobre monetização da produção criativa após aplicação do método.",
      },
    ],
  },

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
  pain: CoursePainCopy | null;
  method: CourseMethodCopy | null;
  transformation: CourseTransformationCopy | null;
  bonuses: CourseBonusesCopy | null;
  valueStack: CourseValueStackCopy | null;
  authority: CourseAuthorityCopy | null;
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
    pain: override.pain ?? null,
    method: override.method ?? null,
    transformation: override.transformation ?? null,
    bonuses: override.bonuses ?? null,
    valueStack: override.valueStack ?? null,
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
