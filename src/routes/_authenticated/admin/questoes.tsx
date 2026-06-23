import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  adminModulesQuery,
  adminQuestionsQuery,
  deleteRow,
  insertRow,
  updateRow,
  type AdminQuestion,
} from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/questoes")({
  component: AdminQuestionsPage,
});

type Draft = Partial<AdminQuestion>;
const empty: Draft = {
  question: "", type: "multiple_choice",
  options: ["", "", "", ""], correct_answer: "", explanation: "", sort_order: 0,
};

function AdminQuestionsPage() {
  const qc = useQueryClient();
  const questions = useQuery(adminQuestionsQuery);
  const modules = useQuery(adminModulesQuery);
  const [filter, setFilter] = useState<string>("");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      if (!d.module_id) throw new Error("Selecione um módulo.");
      const payload = {
        ...d,
        options: d.type === "true_false" ? ["Verdadeiro", "Falso"] : (d.options ?? []).filter(Boolean),
      };
      if (d.id) await updateRow("questions", d.id, payload);
      else await insertRow("questions", payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "questions"] }); toast.success("Questão salva."); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteRow("questions", id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "questions"] }); toast.success("Questão excluída."); },
  });

  const filtered = (questions.data ?? []).filter((q) => !filter || q.module_id === filter);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Questões</h1>
          <p className="text-sm text-muted-foreground">Crie e edite quizzes por módulo.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todos os módulos</option>
            {modules.data?.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <Button onClick={() => { setEditing({ ...empty, module_id: filter || modules.data?.[0]?.id }); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nova
          </Button>
        </div>
      </header>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Pergunta</th><th className="px-4 py-3">Módulo</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((q) => (
              <tr key={q.id}>
                <td className="px-4 py-3 font-medium">{q.question}</td>
                <td className="px-4 py-3 text-muted-foreground">{modules.data?.find(m => m.id === q.module_id)?.title ?? "—"}</td>
                <td className="px-4 py-3 text-xs">{q.type}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...q, options: q.options ?? [] }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Excluir questão?")) del.mutate(q.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {!filtered.length && !questions.isLoading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Nenhuma questão.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar questão" : "Nova questão"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
              <Field label="Módulo">
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={editing.module_id ?? ""} onChange={(e) => setEditing({ ...editing, module_id: e.target.value })} required>
                  <option value="">Selecione…</option>
                  {modules.data?.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </Field>
              <Field label="Pergunta"><Textarea rows={2} value={editing.question ?? ""} onChange={(e) => setEditing({ ...editing, question: e.target.value })} required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={editing.type ?? "multiple_choice"} onChange={(e) => setEditing({ ...editing, type: e.target.value, options: e.target.value === "true_false" ? ["Verdadeiro", "Falso"] : ["", "", "", ""] })}>
                    <option value="multiple_choice">Múltipla escolha</option>
                    <option value="true_false">Verdadeiro/Falso</option>
                  </select>
                </Field>
                <Field label="Ordem"><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
              </div>
              {editing.type !== "true_false" && (
                <Field label="Alternativas">
                  <div className="grid gap-2">
                    {(editing.options ?? []).map((opt, i) => (
                      <Input key={i} value={opt} placeholder={`Alternativa ${i + 1}`}
                        onChange={(e) => {
                          const next = [...(editing.options ?? [])]; next[i] = e.target.value;
                          setEditing({ ...editing, options: next });
                        }} />
                    ))}
                  </div>
                </Field>
              )}
              <Field label="Resposta correta">
                {editing.type === "true_false" ? (
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={editing.correct_answer ?? ""} onChange={(e) => setEditing({ ...editing, correct_answer: e.target.value })} required>
                    <option value="">Selecione…</option>
                    <option value="Verdadeiro">Verdadeiro</option>
                    <option value="Falso">Falso</option>
                  </select>
                ) : (
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={editing.correct_answer ?? ""} onChange={(e) => setEditing({ ...editing, correct_answer: e.target.value })} required>
                    <option value="">Selecione…</option>
                    {(editing.options ?? []).filter(Boolean).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Explicação (opcional)"><Textarea rows={2} value={editing.explanation ?? ""} onChange={(e) => setEditing({ ...editing, explanation: e.target.value })} /></Field>
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
