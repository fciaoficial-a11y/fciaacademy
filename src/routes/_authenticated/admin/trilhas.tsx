import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminTracksQuery, deleteRow, insertRow, updateRow, type AdminTrack } from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/trilhas")({
  component: AdminTracksPage,
});

type Draft = Partial<AdminTrack>;
const empty: Draft = {
  slug: "",
  title: "",
  description: "",
  tag: "Nova",
  level: "Iniciante",
  hours: "10h",
  modules: 0,
  icon: "Sparkles",
  outcomes: [],
  sort_order: 0,
  is_published: false,
};

function AdminTracksPage() {
  const qc = useQueryClient();
  const tracks = useQuery(adminTracksQuery);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = { ...d, outcomes: d.outcomes ?? [] };
      if (d.id) await updateRow("tracks", d.id, payload);
      else await insertRow("tracks", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tracks"] });
      toast.success("Trilha salva.");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteRow("tracks", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tracks"] });
      toast.success("Trilha excluída.");
    },
  });

  const togglePub = useMutation({
    mutationFn: (t: AdminTrack) => updateRow("tracks", t.id, { is_published: !t.is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tracks"] }),
  });

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Trilhas</h1>
          <p className="text-sm text-muted-foreground">Gerencie trilhas de aprendizado.</p>
        </div>
        <Button onClick={() => { setEditing(empty); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova trilha
        </Button>
      </header>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Título</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Nível</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tracks.data?.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium">{t.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.slug}</td>
                <td className="px-4 py-3">{t.level}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${t.is_published ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {t.is_published ? "Publicada" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => togglePub.mutate(t)} title={t.is_published ? "Despublicar" : "Publicar"}>
                    {t.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Excluir "${t.title}"?`)) del.mutate(t.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {!tracks.data?.length && !tracks.isLoading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhuma trilha ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar trilha" : "Nova trilha"}</DialogTitle></DialogHeader>
          {editing && (
            <form
              className="grid gap-3"
              onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
            >
              <Field label="Título"><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></Field>
              <Field label="Slug"><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} required /></Field>
              <Field label="Descrição"><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tag"><Input value={editing.tag ?? ""} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} required /></Field>
                <Field label="Nível"><Input value={editing.level ?? ""} onChange={(e) => setEditing({ ...editing, level: e.target.value })} required /></Field>
                <Field label="Horas"><Input value={editing.hours ?? ""} onChange={(e) => setEditing({ ...editing, hours: e.target.value })} required /></Field>
                <Field label="Ícone (Lucide)"><Input value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} /></Field>
                <Field label="Módulos"><Input type="number" value={editing.modules ?? 0} onChange={(e) => setEditing({ ...editing, modules: Number(e.target.value) })} /></Field>
                <Field label="Ordem"><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Resultados (um por linha)">
                <Textarea rows={3} value={(editing.outcomes ?? []).join("\n")}
                  onChange={(e) => setEditing({ ...editing, outcomes: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
                Publicada
              </label>
              <DialogFooter>
                <Button type="submit" disabled={save.isPending}>Salvar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
