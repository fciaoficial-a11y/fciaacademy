import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/senha")({
  head: () => ({ meta: [{ title: "Trocar senha — Admin FCIA" }] }),
  component: AdminPasswordPage,
});

function AdminPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("A senha deve ter ao menos 8 caracteres.");
    if (password !== confirm) return toast.error("As senhas não coincidem.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) return toast.error(error.message);
    toast.success("Senha atualizada com sucesso.");
    setPassword("");
    setConfirm("");
  }

  return (
    <div className="max-w-lg">
      <header>
        <h1 className="font-display text-2xl font-semibold">Trocar senha</h1>
        <p className="text-sm text-muted-foreground">
          Defina uma nova senha para sua conta admin. A troca é imediata e mantém sua sessão ativa.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl"
      >
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar nova senha</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="mr-2 h-4 w-4" />
          )}
          Atualizar senha
        </Button>
      </form>
    </div>
  );
}
