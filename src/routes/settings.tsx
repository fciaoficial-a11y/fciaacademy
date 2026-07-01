import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SettingsIcon className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold">Configurações</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Gerencie sua conta pelo seu perfil. Configurações avançadas chegam em breve.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/profile"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Ir para o perfil
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
