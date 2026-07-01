import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminPaymentsQuery } from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/pagamentos")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const payments = useQuery(adminPaymentsQuery);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments.data ?? [];
    return (payments.data ?? []).filter((p) =>
      [p.email, p.full_name, p.course_title, p.plan_id, p.status, p.provider_payment_id].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  }, [payments.data, search]);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            <CreditCard className="h-3.5 w-3.5" /> Monetização
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold">Pagamentos</h1>
          <p className="text-sm text-muted-foreground">Acompanhe cobranças PIX, status e liberações automáticas.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="w-72 pl-9" placeholder="Buscar aluno, plano ou status" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </header>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Curso</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{p.full_name ?? p.email ?? "Aluno"}</div>
                  <div className="text-xs text-muted-foreground">{p.email ?? p.provider_payment_id}</div>
                </td>
                <td className="px-4 py-3 uppercase">{p.plan_id}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.course_title ?? "Plano"}</td>
                <td className="px-4 py-3">R$ {Number(p.amount).toFixed(2).replace(".", ",")}</td>
                <td className="px-4 py-3"><PaymentBadge status={p.status} /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
            {!filtered.length && !payments.isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum pagamento encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const approved = status === "received" || status === "confirmed";
  const failed = ["overdue", "refunded", "chargeback", "cancelled", "failed"].includes(status);
  if (approved) return <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Confirmado</Badge>;
  if (failed) return <Badge variant="destructive">{status}</Badge>;
  return <Badge variant="secondary">Pendente</Badge>;
}