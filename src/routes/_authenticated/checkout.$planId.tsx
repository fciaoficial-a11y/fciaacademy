import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixCheckout } from "@/components/payments/PixCheckout";
import { isPaidPlanId, PAID_PLAN_LABEL, type PaidPlanId } from "@/lib/payments";

const searchSchema = z.object({ course: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/checkout/$planId")({
  validateSearch: searchSchema,
  beforeLoad: ({ params }) => {
    if (!isPaidPlanId(params.planId)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `Checkout ${params.planId.toUpperCase()} — FCIA Academy` },
      { name: "description", content: "Checkout PIX seguro para planos da FCIA Academy." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { planId } = Route.useParams();
  const { course } = Route.useSearch();
  const navigate = useNavigate();
  const paidPlan = planId as PaidPlanId;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 rounded-full">
        <Link to="/planos">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar aos planos
        </Link>
      </Button>

      <header className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Pagamento seguro
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
          Ativar plano {PAID_PLAN_LABEL[paidPlan]}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gere o QR Code PIX e aguarde a confirmação automática para liberar o acesso.
        </p>
      </header>

      <PixCheckout planId={paidPlan} courseId={course} onPaid={() => navigate({ to: course ? "/dashboard" : "/profile" })} />
    </div>
  );
}