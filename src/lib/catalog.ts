import {
  Bot,
  Brain,
  Code2,
  DollarSign,
  Rocket,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type Track = {
  slug: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  desc: string;
  level: string;
  hours: string;
  modules: number;
  outcomes: string[];
};

export const tracks: Track[] = [
  {
    slug: "ia-aplicada",
    icon: Bot,
    tag: "Inteligência Artificial",
    title: "IA Aplicada ao Trabalho",
    desc: "Domine ChatGPT, agentes, automações e prompts avançados para produtividade real.",
    level: "Iniciante → Avançado",
    hours: "42h",
    modules: 8,
    outcomes: [
      "Construir agentes de IA para sua rotina",
      "Automatizar fluxos repetitivos com n8n e Zapier",
      "Aplicar prompts avançados em qualquer área",
    ],
  },
  {
    slug: "dev-moderno",
    icon: Code2,
    tag: "Tecnologia",
    title: "Desenvolvimento Moderno",
    desc: "Construa produtos digitais com as stacks mais valorizadas e ship rápido.",
    level: "Do zero ao profissional",
    hours: "120h",
    modules: 14,
    outcomes: [
      "Publicar produtos full-stack com React e TypeScript",
      "Trabalhar com APIs, banco de dados e deploy",
      "Montar portfólio pronto para o mercado",
    ],
  },
  {
    slug: "empreendedorismo",
    icon: Rocket,
    tag: "Negócios",
    title: "Empreendedorismo Digital",
    desc: "Valide, lance e escale um negócio digital com IA, automações e aquisição moderna.",
    level: "Prática guiada",
    hours: "36h",
    modules: 7,
    outcomes: [
      "Validar uma oferta em menos de 30 dias",
      "Estruturar funil, marca e operação",
      "Aplicar IA em vendas, marketing e produto",
    ],
  },
  {
    slug: "renda-com-ia",
    icon: DollarSign,
    tag: "Renda",
    title: "Renda com IA e Freelas",
    desc: "Monte serviços, ofertas e produtos digitais usando IA para gerar renda real.",
    level: "Aplicação imediata",
    hours: "28h",
    modules: 6,
    outcomes: [
      "Lançar 3 ofertas usando IA",
      "Conquistar os primeiros clientes pagantes",
      "Estruturar entrega e precificação",
    ],
  },
  {
    slug: "profissional-do-futuro",
    icon: TrendingUp,
    tag: "Carreira",
    title: "Profissional do Futuro",
    desc: "Reposicione sua carreira com dados, IA e as habilidades mais demandadas.",
    level: "Trilha guiada",
    hours: "54h",
    modules: 9,
    outcomes: [
      "Reescrever seu posicionamento profissional",
      "Dominar ferramentas de dados e IA",
      "Conquistar entrevistas em vagas seniores",
    ],
  },
  {
    slug: "inovacao",
    icon: Brain,
    tag: "Inovação",
    title: "Mentalidade de Inovação",
    desc: "Pense como produto, decida com dados e aplique frameworks para resolver problemas reais.",
    level: "Para líderes e times",
    hours: "24h",
    modules: 5,
    outcomes: [
      "Liderar squads com mentalidade de produto",
      "Aplicar discovery e métricas de impacto",
      "Tomar decisões orientadas a dados",
    ],
  },
];

export function getTrack(slug: string) {
  return tracks.find((t) => t.slug === slug);
}

export type Cohort = {
  id: string;
  trackSlug: string;
  trackTitle: string;
  start: string;
  duration: string;
  format: string;
  seats: number;
  taken: number;
};

export const cohorts: Cohort[] = [
  {
    id: "ia-v4",
    trackSlug: "ia-aplicada",
    trackTitle: "IA Aplicada ao Trabalho",
    start: "10 Jul · 2026",
    duration: "8 semanas",
    format: "Online ao vivo",
    seats: 80,
    taken: 66,
  },
  {
    id: "dev-2026-2",
    trackSlug: "dev-moderno",
    trackTitle: "Desenvolvimento Moderno",
    start: "22 Jul · 2026",
    duration: "16 semanas",
    format: "Híbrido · São Paulo",
    seats: 60,
    taken: 41,
  },
  {
    id: "renda-ia-3",
    trackSlug: "renda-com-ia",
    trackTitle: "Renda com IA e Freelas",
    start: "05 Ago · 2026",
    duration: "6 semanas",
    format: "Online ao vivo",
    seats: 120,
    taken: 88,
  },
  {
    id: "empreender-q3",
    trackSlug: "empreendedorismo",
    trackTitle: "Empreendedorismo Digital",
    start: "19 Ago · 2026",
    duration: "10 semanas",
    format: "Online ao vivo",
    seats: 70,
    taken: 22,
  },
];
