import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Trash2, Upload } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  adminCoursesQuery,
  adminTracksQuery,
  deleteRow,
  insertRow,
  updateRow,
  uploadCourseAsset,
  type AdminCourse,
} from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/cursos")({
  component: AdminCoursesPage,
});

type Draft = Partial<AdminCourse>;
const empty: Draft = {
  slug: "", title: "", description: "", duration_minutes: 60,
  level: "Iniciante", cover_url: null, sort_order: 0, is_published: false,
};

function AdminCoursesPage() {
  const qc = useQueryClient();
  const courses = useQuery(adminCoursesQuery);
  const tracks = useQuery(adminTracksQuery);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      if (!d.track_id) throw new Error("Selecione uma trilha.");
      if (d.id) await updateRow("courses", d.id, d);
      else await insertRow("courses", d);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Curso salvo.");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteRow("courses", id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "courses"] }); toast.success("Curso excluído."); },
  });

  const togglePub = useMutation({
    mutationFn: (c: AdminCourse) => updateRow("courses", c.id, { is_published: !c.is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });

  async function handleCover(file: File) {
    setUploading(true);
    try {
      const url = await uploadCourseAsset(file, "covers");
      setEditing((prev) => prev ? { ...prev, cover_url: url } : prev);
      toast.success("Capa enviada.");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  }

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Cursos</h1>
          <p className="text-sm text-muted-foreground">Gerencie cursos vinculados a trilhas.</p>
        </div>
        <Button onClick={() => { setEditing({ ...empty, track_id: tracks.data?.[0]?.id }); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo curso
        </Button>
      </header>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Título</th><th className="px-4 py-3">Trilha</th><th className="px-4 py-3">Duração</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {courses.data?.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{tracks.data?.find(t => t.id === c.track_id)?.title ?? "—"}</td>
                <td className="px-4 py-3">{c.duration_minutes} min</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${c.is_published ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {c.is_published ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => togglePub.mutate(c)}>
                    {c.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Excluir "${c.title}"?`)) del.mutate(c.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {!courses.data?.length && !courses.isLoading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum curso ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar curso" : "Novo curso"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Trilha</Label>
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editing.track_id ?? ""}
                  onChange={(e) => setEditing({ ...editing, track_id: e.target.value })}
                  required
                >
                  <option value="">Selecione…</option>
                  {tracks.data?.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <Field label="Título"><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></Field>
              <Field label="Slug"><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} required /></Field>
              <Field label="Descrição"><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} required /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Duração (min)"><Input type="number" value={editing.duration_minutes ?? 0} onChange={(e) => setEditing({ ...editing, duration_minutes: Number(e.target.value) })} /></Field>
                <Field label="Nível"><Input value={editing.level ?? ""} onChange={(e) => setEditing({ ...editing, level: e.target.value })} /></Field>
                <Field label="Ordem"><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Capa">
                <div className="flex items-center gap-2">
                  <Input value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} placeholder="URL da imagem" />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Enviando…" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleCover(e.target.files[0])} />
                  </label>
                </div>
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
                Publicado
              </label>
              <DialogFooter><Button type="submit" disabled={save.isPending}>Salvar</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
