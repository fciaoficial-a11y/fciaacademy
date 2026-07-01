import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/turmas")({
  head: () => ({
    meta: [
      { title: "Turmas — Em breve" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TurmasPage,
});

function TurmasPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Users className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold">Turmas ao vivo</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Cohorts e turmas mentoradas chegam em breve. Por enquanto, siga no ritmo autoguiado das trilhas.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/trilhas"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Explorar trilhas
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
