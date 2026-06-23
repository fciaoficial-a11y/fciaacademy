import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, ExternalLink, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminCertificatesQuery,
  adminCoursesQuery,
  adminUsersQuery,
  updateRow,
} from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/certificados")({
  component: AdminCertificatesPage,
});

function AdminCertificatesPage() {
  const qc = useQueryClient();
  const certs = useQuery(adminCertificatesQuery);
  const courses = useQuery(adminCoursesQuery);
  const users = useQuery(adminUsersQuery);
  const [search, setSearch] = useState("");

  const toggleRevoke = useMutation({
    mutationFn: ({ id, revoked }: { id: string; revoked: boolean }) =>
      updateRow("certificates", id, { revoked_at: revoked ? null : new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "certificates"] }); toast.success("Status atualizado."); },
  });

  const filtered = (certs.data ?? []).filter((c) => {
    if (!search) return true;
    const u = users.data?.find(x => x.id === c.user_id);
    const co = courses.data?.find(x => x.id === c.course_id);
    return [c.validation_code, u?.full_name, u?.email, co?.title]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Certificados</h1>
          <p className="text-sm text-muted-foreground">Consulte, valide e revogue certificados.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="w-72 pl-9" placeholder="Buscar código, aluno ou curso" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </header>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Aluno</th><th className="px-4 py-3">Curso</th><th className="px-4 py-3">Emitido em</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((c) => {
              const u = users.data?.find(x => x.id === c.user_id);
              const co = courses.data?.find(x => x.id === c.course_id);
              const revoked = !!c.revoked_at;
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-xs">{c.validation_code}</td>
                  <td className="px-4 py-3">{u?.full_name ?? u?.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{co?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.issued_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${revoked ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                      {revoked ? "Revogado" : "Válido"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/validar-certificado/$codigo" params={{ codigo: c.validation_code }} target="_blank">
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => toggleRevoke.mutate({ id: c.id, revoked })}>
                      {revoked ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4 text-destructive" />}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && !certs.isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum certificado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
