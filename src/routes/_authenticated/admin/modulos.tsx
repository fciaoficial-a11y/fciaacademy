import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload } from "lucide-react";
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
  adminModulesQuery,
  deleteRow,
  insertRow,
  updateRow,
  uploadCourseAsset,
  type AdminModule,
} from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/modulos")({
  component: AdminModulesPage,
});

type Draft = Partial<AdminModule>;
const empty: Draft = {
  slug: "", title: "", description: "", content_type: "video", content_url: "",
  content_text: "", duration_minutes: 10, sort_order: 0, is_published: true,
};

function AdminModulesPage() {
  const qc = useQueryClient();
  const modules = useQuery(adminModulesQuery);
  const courses = useQuery(adminCoursesQuery);
  const [filter, setFilter] = useState<string>("");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      if (!d.course_id) throw new Error("Selecione um curso.");
      if (d.id) await updateRow("modules", d.id, d);
      else await insertRow("modules", d);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "modules"] }); toast.success("Módulo salvo."); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteRow("modules", id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "modules"] }); toast.success("Módulo excluído."); },
  });

  const reorder = useMutation({
    mutationFn: async ({ m, dir }: { m: AdminModule; dir: -1 | 1 }) =>
      updateRow("modules", m.id, { sort_order: m.sort_order + dir }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "modules"] }),
  });

  async function handlePdf(file: File) {
    setUploading(true);
    try {
      const url = await uploadCourseAsset(file, "pdfs");
      setEditing((prev) => prev ? { ...prev, content_url: url, content_type: "pdf" } : prev);
      toast.success("PDF enviado.");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  }

  const filtered = (modules.data ?? []).filter((m) => !filter || m.course_id === filter);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Módulos</h1>
          <p className="text-sm text-muted-foreground">Vídeos, PDFs e textos por curso.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todos os cursos</option>
            {courses.data?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <Button onClick={() => { setEditing({ ...empty, course_id: filter || courses.data?.[0]?.id }); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo
          </Button>
        </div>
      </header>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Ordem</th><th className="px-4 py-3">Título</th><th className="px-4 py-3">Curso</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-mono text-xs">{m.sort_order}</td>
                <td className="px-4 py-3 font-medium">{m.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{courses.data?.find(c => c.id === m.course_id)?.title ?? "—"}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{m.content_type}</span></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => reorder.mutate({ m, dir: -1 })}><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => reorder.mutate({ m, dir: 1 })}><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(m); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Excluir "${m.title}"?`)) del.mutate(m.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {!filtered.length && !modules.isLoading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum módulo.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar módulo" : "Novo módulo"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
              <Field label="Curso">
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={editing.course_id ?? ""} onChange={(e) => setEditing({ ...editing, course_id: e.target.value })} required>
                  <option value="">Selecione…</option>
                  {courses.data?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </Field>
              <Field label="Título"><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></Field>
              <Field label="Slug"><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} required /></Field>
              <Field label="Descrição"><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Tipo">
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={editing.content_type ?? "video"} onChange={(e) => setEditing({ ...editing, content_type: e.target.value })}>
                    <option value="video">Vídeo</option>
                    <option value="pdf">PDF</option>
                    <option value="text">Texto</option>
                  </select>
                </Field>
                <Field label="Duração (min)"><Input type="number" value={editing.duration_minutes ?? 0} onChange={(e) => setEditing({ ...editing, duration_minutes: Number(e.target.value) })} /></Field>
                <Field label="Ordem"><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
              </div>
              {editing.content_type !== "text" && (
                <Field label="URL do conteúdo">
                  <div className="flex items-center gap-2">
                    <Input value={editing.content_url ?? ""} onChange={(e) => setEditing({ ...editing, content_url: e.target.value })} placeholder={editing.content_type === "video" ? "URL do vídeo (YouTube embed)" : "URL do PDF"} />
                    {editing.content_type === "pdf" && (
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                        <Upload className="h-4 w-4" />
                        {uploading ? "…" : "Upload"}
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePdf(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </Field>
              )}
              {editing.content_type === "text" && (
                <Field label="Texto"><Textarea rows={6} value={editing.content_text ?? ""} onChange={(e) => setEditing({ ...editing, content_text: e.target.value })} /></Field>
              )}
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
