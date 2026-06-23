import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { plansQuery, currentPlanIdQuery, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — FCIA Academy" },
      { name: "description", content: "Compare os planos da FCIA Academy: Free, Starter, Pro e Expert." },
    ],
  }),
  component: PlanosPage,
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-destructive">Erro ao carregar planos: {String(error)}</div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Página não encontrada.</div>,
});

const PLAN_ICONS: Record<PlanId, typeof Sparkles> = {
  free: Sparkles,
  starter: Zap,
  pro: Crown,
  expert: Crown,
};

function PlanosPage() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const plans = useQuery(plansQuery);
  const currentPlan = useQuery(currentPlanIdQuery(userId));

  return (
    <div className="relative mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Planos
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Escolha seu <span className="text-gradient">plano</span>
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
          Comece grátis e evolua conforme sua jornada. Cancele quando quiser.
        </p>
      </div>

      {plans.isLoading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-card/40" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(plans.data ?? []).map((plan) => {
            const Icon = PLAN_ICONS[plan.id];
            const isCurrent = currentPlan.data === plan.id;
            const highlight = plan.id === "pro";
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card/60 p-6 backdrop-blur-xl transition-all",
                  highlight
                    ? "border-primary/40 ring-1 ring-primary/30 lg:-translate-y-2"
                    : "border-white/10 hover:border-primary/30",
                )}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Mais popular
                  </div>
                )}
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">
                    {plan.price === 0 ? "Grátis" : `R$${plan.price.toFixed(2).replace(".", ",")}`}
                  </span>
                  {plan.price > 0 && <span className="text-sm text-muted-foreground">/mês</span>}
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={isCurrent ? "outline" : highlight ? "default" : "secondary"}
                  disabled={isCurrent}
                  asChild={!isCurrent}
                >
                  {isCurrent ? (
                    <span>Plano atual</span>
                  ) : (
                    <Link to={userId ? "/dashboard" : "/register"}>
                      {plan.id === "free" ? "Começar grátis" : "Assinar"}
                    </Link>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-center text-xs text-muted-foreground">
        Pagamentos via Stripe, Mercado Pago e PIX serão habilitados em breve.
      </p>
    </div>
  );
}
