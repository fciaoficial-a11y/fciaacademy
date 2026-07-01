import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [
      { title: "Inscrição — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: InscricaoPage,
});

function InscricaoPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold">Inscrição</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Hoje a matrícula acontece direto ao entrar em uma trilha. Crie sua conta gratuita e comece agora.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/register"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Criar conta grátis
        </Link>
        <Link
          to="/trilhas"
          className="inline-flex items-center rounded-full border border-white/10 px-5 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Ver trilhas
        </Link>
      </div>
    </div>
  );
}
