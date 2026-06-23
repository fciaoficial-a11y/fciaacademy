import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import { Section, Eyebrow } from "@/components/site/Section";
import { tracks } from "@/lib/catalog";
import { useState } from "react";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [
      { title: "Inscrição — FCIA Academy" },
      { name: "description", content: "Garanta sua vaga na próxima turma da FCIA Academy." },
      { property: "og:title", content: "Inscreva-se na FCIA Academy" },
      { property: "og:description", content: "Conversão guiada em 3 passos." },
    ],
  }),
  component: InscricaoPage,
});

function InscricaoPage() {
  const [step, setStep] = useState(1);
  const [trackSlug, setTrackSlug] = useState(tracks[0].slug);

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <aside>
          <Eyebrow>Inscrição</Eyebrow>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Garanta sua vaga em 3 passos.
          </h1>
          <p className="mt-5 text-muted-foreground">
            Processo rápido. Em até 48h confirmamos sua vaga e enviamos o material de boas-vindas.
          </p>

          <ol className="mt-10 space-y-3">
            {["Escolha sua trilha", "Seus dados", "Confirmação"].map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <li
                  key={label}
                  className={
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors " +
                    (active
                      ? "border-foreground bg-background text-foreground"
                      : done
                        ? "border-border bg-surface text-muted-foreground"
                        : "border-border bg-background text-muted-foreground")
                  }
                >
                  <span
                    className={
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono " +
                      (done
                        ? "bg-primary text-primary-foreground"
                        : active
                          ? "bg-foreground text-background"
                          : "bg-surface-muted text-muted-foreground")
                    }
                  >
                    {done ? "✓" : n}
                  </span>
                  {label}
                </li>
              );
            })}
          </ol>

          <div className="mt-10 rounded-2xl border border-border bg-surface p-5 text-sm">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Garantias
            </div>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" /> 7 dias de garantia incondicional</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" /> Acesso vitalício ao conteúdo</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" /> Certificado verificável</li>
            </ul>
          </div>
        </aside>

        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
          {step === 1 && (
            <>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Escolha sua trilha</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Você pode trocar a qualquer momento. Em caso de dúvida, comece pela mais alinhada ao seu objetivo atual.
              </p>
              <div className="mt-6 grid gap-3">
                {tracks.map((t) => {
                  const selected = trackSlug === t.slug;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => setTrackSlug(t.slug)}
                      className={
                        "flex items-start gap-4 rounded-xl border p-4 text-left transition-colors " +
                        (selected
                          ? "border-foreground bg-surface"
                          : "border-border bg-background hover:bg-surface")
                      }
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-base font-semibold tracking-tight">{t.title}</h3>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {t.hours}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{t.desc}</p>
                      </div>
                      <span
                        className={
                          "h-4 w-4 shrink-0 rounded-full border " +
                          (selected ? "border-foreground bg-primary" : "border-border bg-background")
                        }
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:-translate-y-0.5"
                >
                  Continuar <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Seus dados</h2>
              <p className="mt-2 text-sm text-muted-foreground">Usamos apenas para confirmar sua inscrição.</p>
              <div className="mt-6 grid gap-4">
                <Input label="Nome completo" required />
                <Input label="Email" type="email" required />
                <Input label="WhatsApp" placeholder="+55 11 9 0000-0000" />
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground">
                  ← Voltar
                </button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:-translate-y-0.5">
                  Revisar inscrição <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">Inscrição enviada!</h2>
              <p className="mt-3 text-muted-foreground">
                Em até 48h nosso time entra em contato com os próximos passos.
              </p>
              <Link
                to="/trilhas"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-surface"
              >
                Explorar mais trilhas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}
