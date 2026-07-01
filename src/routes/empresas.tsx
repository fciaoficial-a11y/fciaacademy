import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "FCIA para Empresas — Em breve" },
      { name: "description", content: "Trilhas corporativas da FCIA Academy para times de alta performance." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EmpresasPage,
});

function EmpresasPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Building2 className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold">FCIA para Empresas</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Estamos preparando trilhas corporativas com relatórios de progresso para times.
        Enquanto isso, conheça a experiência do aluno.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/trilhas"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Ver trilhas
        </Link>
        <Link
          to="/"
          className="inline-flex items-center rounded-full border border-white/10 px-5 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Voltar
        </Link>
      </div>
    </div>
  );
}
