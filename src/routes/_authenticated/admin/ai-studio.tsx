import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Loader2, Sparkles, RotateCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateAiContent, type GeneratorType } from "@/lib/ai-studio.functions";
import {
  adminCoursesQuery,
  adminModulesQuery,
  insertRow,
  updateRow,
} from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/ai-studio")({
  head: () => ({ meta: [{ title: "AI Content Studio — Admin" }] }),
  component: AiStudio,
});

type GenMeta = {
  id: GeneratorType;
  title: string;
  description: string;
  placeholder: string;
  priority?: boolean;
};

const GENERATORS: GenMeta[] = [
  {
    id: "questions",
    title: "Gerar Questões",
    description: "Cria questões de avaliação (múltipla escolha / V-F). Pode salvar em um módulo.",
    placeholder: "Tópico, nível, objetivos. Ex.: 'Fundamentos de RLS no Postgres, nível intermediário, 8 questões.'",
    priority: true,
  },
  {
    id: "module_summary",
    title: "Gerar Resumo do Módulo",
    description: "Resumo conciso e didático para um módulo.",
    placeholder: "Tema do módulo + pontos a cobrir.",
    priority: true,
  },
  {
    id: "learning_objectives",
    title: "Gerar Objetivos de Aprendizagem",
    description: "Objetivos mensuráveis (Bloom).",
    placeholder: "Curso ou módulo + público-alvo.",
    priority: true,
  },
  {
    id: "full_course",
    title: "Gerar Curso Completo",
    description: "Estrutura completa (título, descrição, módulos).",
    placeholder: "Tema, duração desejada, público.",
    priority: true,
  },
  {
    id: "course_copy",
    title: "Gerar Copy do Curso",
    description: "Texto de marketing persuasivo.",
    placeholder: "Sobre o curso, diferencial, público.",
  },
  {
    id: "exercises",
    title: "Gerar Exercícios",
    description: "Exercícios práticos com critério de sucesso.",
    placeholder: "Tópico + nível de dificuldade.",
  },
  {
    id: "certificate_text",
    title: "Gerar Texto do Certificado",
    description: "Texto formal para certificado.",
    placeholder: "Nome do curso e competências adquiridas.",
  },
];

function AiStudio() {
  const [active, setActive] = useState<GeneratorType>("questions");
  const meta = useMemo(() => GENERATORS.find((g) => g.id === active)!, [active]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">AI Content Studio</h1>
          <p className="text-sm text-muted-foreground">
            Acelere a produção de cursos. Nada é publicado sem sua revisão.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GENERATORS.map((g) => {
          const isActive = g.id === active;
          return (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                isActive
                  ? "border-primary/40 bg-white/8"
                  : "border-white/10 bg-card/60 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{g.title}</span>
                {g.priority && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                    prioridade
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{g.description}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <GeneratorPanel key={active} meta={meta} />
      </div>
    </div>
  );
}

function GeneratorPanel({ meta }: { meta: GenMeta }) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const generate = useServerFn(generateAiContent);
  const qc = useQueryClient();

  const gen = useMutation({
    mutationFn: async () => {
      const res = await generate({ data: { type: meta.id, prompt } });
      return res.content;
    },
    onSuccess: (content) => {
      setOutput(content);
      toast.success("Conteúdo gerado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const courses = useQuery(adminCoursesQuery);
  const modules = useQuery(adminModulesQuery);

  const [targetCourse, setTargetCourse] = useState<string>("");
  const [targetModule, setTargetModule] = useState<string>("");

  const courseModules = useMemo(
    () => (modules.data ?? []).filter((m) => !targetCourse || m.course_id === targetCourse),
    [modules.data, targetCourse],
  );

  const save = useMutation({
    mutationFn: async () => {
      if (!output.trim()) throw new Error("Nada para salvar");

      switch (meta.id) {
        case "questions": {
          if (!targetModule) throw new Error("Selecione o módulo destino");
          let parsed: { questions: Array<Record<string, unknown>> };
          try {
            parsed = JSON.parse(extractJson(output));
          } catch {
            throw new Error("Saída não é JSON válido. Edite e tente novamente.");
          }
          const rows = parsed.questions.map((q, i) => ({
            module_id: targetModule,
            question: String(q.question ?? ""),
            type: String(q.type ?? "multiple_choice"),
            options: q.options ?? [],
            correct_answer: String(q.correct_answer ?? ""),
            explanation: q.explanation ? String(q.explanation) : null,
            sort_order: i,
          }));
          for (const r of rows) await insertRow("questions", r);
          await qc.invalidateQueries({ queryKey: ["admin", "questions"] });
          return `${rows.length} questões salvas (rascunho — revise em /admin/questoes).`;
        }
        case "module_summary":
        case "learning_objectives":
        case "exercises": {
          if (!targetModule) throw new Error("Selecione o módulo destino");
          await updateRow("modules", targetModule, { description: output });
          await qc.invalidateQueries({ queryKey: ["admin", "modules"] });
          return "Conteúdo salvo na descrição do módulo.";
        }
        case "course_copy":
        case "certificate_text": {
          if (!targetCourse) throw new Error("Selecione o curso destino");
          await updateRow("courses", targetCourse, { description: output });
          await qc.invalidateQueries({ queryKey: ["admin", "courses"] });
          return "Texto salvo na descrição do curso.";
        }
        case "full_course": {
          let parsed: {
            title: string;
            description: string;
            modules?: Array<{ title: string; summary?: string; duration_minutes?: number }>;
          };
          try {
            parsed = JSON.parse(extractJson(output));
          } catch {
            throw new Error("Saída não é JSON válido. Edite e tente novamente.");
          }
          const slug = slugify(parsed.title);
          const courseRow = {
            slug,
            title: parsed.title,
            description: parsed.description,
            level: "Iniciante",
            duration_minutes: 0,
            sort_order: 999,
            is_published: false,
          };
          // requires track_id — leave to admin to attach. Insert into courses if track admin chose.
          if (!targetCourse) throw new Error("Selecione uma trilha existente em 'Curso destino' (será usada como track).");
          await insertRow("courses", { ...courseRow, track_id: targetCourse });
          await qc.invalidateQueries({ queryKey: ["admin", "courses"] });
          return `Curso "${parsed.title}" criado como rascunho (não publicado).`;
        }
      }
    },
    onSuccess: (msg) => toast.success(msg as string),
    onError: (e: Error) => toast.error(e.message),
  });

  const needsModule = ["questions", "module_summary", "learning_objectives", "exercises"].includes(
    meta.id,
  );
  const needsCourse = ["course_copy", "certificate_text", "full_course"].includes(meta.id);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{meta.title}</CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Prompt / Contexto</Label>
            <Textarea
              rows={8}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={meta.placeholder}
            />
          </div>
          <Button
            onClick={() => gen.mutate()}
            disabled={gen.isPending || prompt.trim().length < 3}
            className="w-full"
          >
            {gen.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Gerando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> ✨ Gerar com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview & edição</CardTitle>
          <CardDescription>Edite livremente antes de salvar. Nada é publicado automaticamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={14}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Resultado aparecerá aqui…"
            className="font-mono text-xs"
          />

          {needsCourse && (
            <div className="space-y-2">
              <Label>{meta.id === "full_course" ? "Trilha destino (para novo curso)" : "Curso destino"}</Label>
              <Select value={targetCourse} onValueChange={setTargetCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {(courses.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={meta.id === "full_course" ? c.track_id : c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {needsModule && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Curso</Label>
                <Select value={targetCourse} onValueChange={(v) => { setTargetCourse(v); setTargetModule(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Curso…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(courses.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Módulo destino</Label>
                <Select value={targetModule} onValueChange={setTargetModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Módulo…" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseModules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => gen.mutate()}
              disabled={gen.isPending || prompt.trim().length < 3}
            >
              <RotateCw className="h-4 w-4" /> Regenerar
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || !output.trim()}
              className="ml-auto"
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar (rascunho)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
