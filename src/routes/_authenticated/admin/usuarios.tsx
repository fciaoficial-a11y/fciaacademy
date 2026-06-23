import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { adminUsersQuery, updateRow, type AdminUser } from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const qc = useQueryClient();
  const users = useQuery(adminUsersQuery);
  const [search, setSearch] = useState("");

  const updateUser = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AdminUser> }) =>
      updateRow("profiles", id, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Usuário atualizado."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (users.data ?? []).filter((u) =>
    !search || [u.email, u.full_name].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Usuários</h1>
          <p className="text-sm text-muted-foreground">Status, plano, XP e certificados por usuário.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="w-72 pl-9" placeholder="Buscar nome ou e-mail" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </header>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Nível</th>
              <th className="px-4 py-3">Certs.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{u.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{u.role}</span></td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={u.status}
                    onChange={(e) => updateUser.mutate({ id: u.id, patch: { status: e.target.value } })}
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={u.plan}
                    onChange={(e) => updateUser.mutate({ id: u.id, patch: { plan: e.target.value } })}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </td>
                <td className="px-4 py-3 font-mono">{u.xp}</td>
                <td className="px-4 py-3 text-xs">{u.level}</td>
                <td className="px-4 py-3 font-mono">{u.certificates_count}</td>
              </tr>
            ))}
            {!filtered.length && !users.isLoading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
