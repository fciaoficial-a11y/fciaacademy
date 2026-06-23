import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, Building2, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { Section, SectionHeading, Eyebrow } from "@/components/site/Section";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "FCIA Academy para Empresas — Treinamento corporativo em IA" },
      { name: "description", content: "Trilhas customizadas, plataforma white-label e mentoria dedicada para PMEs e grandes empresas." },
      { property: "og:title", content: "FCIA Academy · Empresas" },
      { property: "og:description", content: "Treinamento corporativo em tecnologia, IA e novos negócios." },
    ],
  }),
  component: EmpresasPage,
});

const features = [
  { icon: Building2, title: "Plataforma white-label", desc: "Ambiente exclusivo com a marca da sua empresa, gestão centralizada e SSO." },
  { icon: BarChart3, title: "Relatórios de progresso", desc: "Dashboards com evolução por trilha, área e colaborador." },
  { icon: Users, title: "Mentoria dedicada", desc: "Especialistas acompanham o time com sessões ao vivo e suporte assíncrono." },
  { icon: ShieldCheck, title: "Segurança e compliance", desc: "Infra robusta, LGPD-ready e contratos sob medida para corporações." },
];

const pricing = [
  { name: "Start", target: "Times de até 30 pessoas", price: "Sob consulta", items: ["Catálogo completo", "Relatórios mensais", "Suporte por chat"] },
  { name: "Scale", target: "100 a 500 colaboradores", price: "Sob consulta", items: ["White-label", "Trilhas customizadas", "Customer success dedicado"], highlight: true },
  { name: "Enterprise", target: "+500 colaboradores", price: "Sob consulta", items: ["SSO + integrações", "Mentoria executiva", "SLA empresarial"] },
];

function EmpresasPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-faint opacity-50" />
        <div className="absolute -left-32 top-10 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <Eyebrow>FCIA / Empresas</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            Transforme seu time em <span className="text-primary">time de IA</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Treinamento corporativo em IA, tecnologia e novos negócios. Para PMEs que querem acelerar e grandes empresas que querem escalar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contato"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:-translate-y-0.5"
            >
              Falar com vendas <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-surface"
            >
              Ver planos
            </a>
          </div>
        </div>
      </section>

      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="O que você recebe"
          title="Uma plataforma corporativa de verdade — não um catálogo."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-background p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-background">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="planos" className="border-b border-border bg-surface">
        <SectionHeading eyebrow="Planos" title="Modelos pensados para cada estágio." align="center" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={
                "relative rounded-2xl border bg-background p-7 " +
                (p.highlight
                  ? "border-foreground shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]"
                  : "border-border")
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                  Mais escolhido
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold tracking-tight">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.target}</p>
              <div className="mt-6 font-display text-3xl font-semibold">{p.price}</div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    {i}
                  </li>
                ))}
              </ul>
              <a
                href="#contato"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:-translate-y-0.5"
              >
                Quero esse plano
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Testimonials
        eyebrow="Empresas que treinam com a FCIA"
        title="Resultado mensurável em times reais."
        description="De startups em escala a corporações: a FCIA acelera capacitação com clareza, ritmo e governança."
      />

      <FAQ
        eyebrow="Dúvidas corporativas"
        title="Tudo o que RH e líderes costumam perguntar."
        items={[
          { q: "Como funciona a precificação corporativa?", a: "Trabalhamos por licenças anuais com escala por número de colaboradores. Quanto maior o time, menor o custo por licença." },
          { q: "Conseguem customizar trilhas para a nossa realidade?", a: "Sim. Nosso time de conteúdo desenha trilhas específicas por área, com cases e dados da sua empresa." },
          { q: "Há integração com nosso LMS / SSO?", a: "Sim. Integramos com os principais LMSs do mercado e oferecemos SSO via SAML, Google e Microsoft." },
          { q: "Qual o tempo médio de implementação?", a: "Entre 7 e 21 dias, dependendo do escopo de customização e integrações." },
          { q: "Vocês emitem nota fiscal e contrato MSA?", a: "Sim. Atuamos com contratos MSA, NDAs específicos e nota fiscal nacional." },
        ]}
      />

      <Section id="contato">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>Falar com vendas</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight">
              Vamos desenhar a melhor solução para o seu time.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Conte um pouco sobre sua empresa. Em até 1 dia útil, nosso time entra em contato com uma proposta personalizada.
            </p>
          </div>
          <form
            className="rounded-3xl border border-border bg-card p-7"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-4">
              <Field label="Nome" />
              <Field label="Email corporativo" type="email" />
              <Field label="Empresa" />
              <Field label="Tamanho do time" placeholder="ex.: 50 pessoas" />
              <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:-translate-y-0.5">
                Enviar proposta
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}
