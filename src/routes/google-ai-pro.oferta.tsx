import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Clock, Gift, CheckCircle2, Star } from "lucide-react";
import { PixCheckout } from "@/components/payments/PixCheckout";

export const Route = createFileRoute("/google-ai-pro/oferta")({
  head: () => ({
    meta: [
      { title: "Google AI Pro — FCIA Academy" },
      { name: "description", content: "Acesso à plataforma Google AI Pro por 18 meses. Ativação por convite no e-mail. Bônus: Masterclass Método IA Criativa para os 10 primeiros." },
    ],
  }),
  component: GoogleAIProOferta,
});

// Substituir pelo UUID real do curso após a migration criar o registro:
// SELECT id FROM courses WHERE slug = 'google-ai-pro';
// Atualize o valor abaixo e recompile.
const GOOGLE_AI_PRO_COURSE_ID = "00000000-0000-0000-0000-000000000000";

function GoogleAIProOferta() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="font-display text-xl font-semibold tracking-tight">FCIA Academy</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-16">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Star className="h-3 w-3" /> Oferta especial de lançamento
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Google AI Pro — 18 meses
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Acesso completo à plataforma Google AI Pro. Ativação individual por convite
            enviado ao seu e-mail. Sem conta compartilhada.
          </p>
        </section>

        <section className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-8 py-4 border-b border-primary/15">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold">Google AI Pro</h2>
                  <p className="text-sm text-muted-foreground">Acesso por 18 meses · 1 usuário</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold">R$ 149,90</div>
                  <div className="text-xs text-muted-foreground">pagamento único</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-8">
              <ul className="space-y-2.5">
                {[
                  { icon: Clock, text: "18 meses de acesso à plataforma" },
                  { icon: ShieldCheck, text: "Ativação por convite no seu e-mail" },
                  { icon: CheckCircle2, text: "Uso individual — sem conta compartilhada" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  A ativação do convite será enviada em até 48h após a confirmação do pagamento PIX.
                  Você receberá no e-mail informado no checkout.
                </p>
              </div>

              <PixCheckout
                mode="course"
                courseId={GOOGLE_AI_PRO_COURSE_ID}
                title="Google AI Pro — 18 meses"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-accent/5 p-8">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Bônus limitado
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold">
                  Masterclass Método IA Criativa
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Liberada automaticamente na sua área do aluno após confirmação do PIX.
                </p>
                <p className="mt-2 text-sm font-semibold text-accent">
                  Disponible apenas para os 10 primeiros pagamentos PIX aprovados.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-center font-display text-2xl font-semibold">Como funciona</h2>
          <ol className="space-y-4">
            {[
              { step: "1", title: "Gere o PIX", body: "Clique em \"Gerar QR Code PIX\" e pague pelo app do seu banco." },
              { step: "2", title: "Confirmação automática", body: "O Asaas confirma o pagamento em minutos. Você recebe um e-mail de confirmação." },
              { step: "3", title: "Ativação em até 48h", body: "O convite de acesso ao Google AI Pro é enviado ao seu e-mail." },
              { step: "4", title: "Bônus na área do aluno", body: "Se você estiver entre os 10 primeiros, a Masterclass aparece na sua área do aluno." },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                  {step}
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t py-8 mt-16">
        <p className="text-center text-xs text-muted-foreground">
          FCIA Academy
        </p>
      </footer>
    </div>
  );
}
