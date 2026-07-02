import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Sparkles, RotateCw, Save, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { generateCourseFromBrief, saveCourseDraft } from "@/lib/ai-studio.functions";
import { adminTracksQuery } from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/gerar-curso")({
  head: () => ({ meta: [{ title: "Gerar curso com IA — Admin" }] }),
  component: GerarCurso,
});

type Section = "all" | "description" | "modules" | "quiz" | "pdf_outline";

interface GeneratedModule {
  title: string;
  slug?: string;
  objective?: string;
  summary?: string;
  content_md?: string;
  duration_minutes?: number;
  pdf_outline?: string[];
  practical_activity?: string;
  quiz?: Array<{
    question: string;
    type: "multiple_choice" | "true_false";
    options: string[];
    correct_answer: string;
    explanation?: string;
  }>;
}

interface GeneratedCourse {
  slug?: string;
  short_description?: string;
  full_description?: string;
  promise?: string;
  audience?: string;
  prerequisites?: string[];
  learning_outcomes?: string[];
  cover_prompt?: string;
  modules?: GeneratedModule[];
}

function GerarCurso() {
  const navigate = useNavigate();
  const tracks = useQuery(adminTracksQuery);
  const generate = useServerFn(generateCourseFromBrief);
  const save = useServerFn(saveCourseDraft);

  const [title, setTitle] = useState("");
  const [baseDescription, setBaseDescription] = useState("");
  const [trackId, setTrackId] = useState<string>("none");
  const [level, setLevel] = useState<"Iniciante" | "Intermediário" | "Avançado">("Iniciante");
  const [hours, setHours] = useState(4);
  const [moduleCount, setModuleCount] = useState(6);
  const [audience, setAudience] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [keywords, setKeywords] = useState("");
  const [references, setReferences] = useState("");
  const [tone, setTone] = useState("didático, prático, acessível");

  const [course, setCourse] = useState<GeneratedCourse | null>(null);

  const genMut = useMutation({
    mutationFn: async (section: Section) => {
      const res = await generate({
        data: {
          title,
          base_description: baseDescription,
          track_id: trackId === "none" ? null : trackId,
          level,
          workload_hours: hours,
          module_count: moduleCount,
          audience,
          main_goal: mainGoal,
          keywords,
          references,
          tone,
          section,
        },
      });
      return JSON.parse(res.courseJson) as GeneratedCourse;
    },
    onSuccess: (data, section) => {
      if (section === "all" || !course) {
        setCourse(data);
      } else if (section === "modules") {
        setCourse({ ...course, modules: data.modules ?? [] });
      } else if (section === "quiz" && course.modules) {
        setCourse({
          ...course,
          modules: course.modules.map((m, i) => ({
            ...m,
            quiz: data.modules?.[i]?.quiz ?? m.quiz,
          })),
        });
      } else if (section === "pdf_outline" && course.modules) {
        setCourse({
          ...course,
          modules: course.modules.map((m, i) => ({
            ...m,
            pdf_outline: data.modules?.[i]?.pdf_outline ?? m.pdf_outline,
          })),
        });
      } else {
        setCourse({ ...course, ...data, modules: course.modules });
      }
      toast.success("Geração concluída");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!course) throw new Error("Nada para salvar");
      return save({
        data: {
          track_id: trackId === "none" ? null : trackId,
          title,
          level,
          workload_hours: hours,
          course: {
            slug: course.slug ?? "",
            short_description: course.short_description ?? "",
            full_description: course.full_description ?? "",
            promise: course.promise ?? "",
            audience: course.audience ?? "",
            prerequisites: course.prerequisites ?? [],
            learning_outcomes: course.learning_outcomes ?? [],
            cover_prompt: course.cover_prompt ?? "",
            modules: (course.modules ?? []).map((m) => ({
              title: m.title,
              slug: m.slug ?? "",
              objective: m.objective ?? "",
              summary: m.summary ?? "",
              content_md: m.content_md ?? "",
              duration_minutes: m.duration_minutes ?? 20,
              pdf_outline: m.pdf_outline ?? [],
              practical_activity: m.practical_activity ?? "",
              quiz: m.quiz ?? [],
            })),
          },
        },
      });
    },
    onSuccess: (r) => {
      toast.success("Rascunho salvo!");
      navigate({ to: "/admin/cursos" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canGenerate = title.trim().length >= 3 && baseDescription.trim().length >= 10;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" /> Gerar curso com IA
        </h1>
        <p className="text-muted-foreground">
          Informe um brief curto. A IA expande em curso completo (módulos, quiz, PDF outline). Fica salvo como rascunho.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Brief do curso</CardTitle>
          <CardDescription>Só o essencial. A IA cuida do resto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Título do curso *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Fundamentos de Blindagem Emocional" />
          </div>
          <div className="md:col-span-2">
            <Label>Descrição base *</Label>
            <Textarea rows={3} value={baseDescription} onChange={(e) => setBaseDescription(e.target.value)} placeholder="Descreva o tema, contexto e o que o aluno vai aprender" />
          </div>
          <div>
            <Label>Trilha</Label>
            <Select value={trackId} onValueChange={setTrackId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem trilha</SelectItem>
                {tracks.data?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nível</Label>
            <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Carga horária (h)</Label>
            <Input type="number" min={1} max={200} value={hours} onChange={(e) => setHours(Number(e.target.value) || 4)} />
          </div>
          <div>
            <Label>Quantidade de módulos</Label>
            <Input type="number" min={3} max={12} value={moduleCount} onChange={(e) => setModuleCount(Number(e.target.value) || 6)} />
          </div>
          <div>
            <Label>Público-alvo</Label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex.: profissionais de segurança" />
          </div>
          <div>
            <Label>Objetivo principal</Label>
            <Input value={mainGoal} onChange={(e) => setMainGoal(e.target.value)} placeholder="O que o aluno deve conseguir ao final" />
          </div>
          <div>
            <Label>Palavras-chave</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="separadas por vírgula" />
          </div>
          <div>
            <Label>Tom didático</Label>
            <Input value={tone} onChange={(e) => setTone(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Referências (opcional)</Label>
            <Textarea rows={2} value={references} onChange={(e) => setReferences(e.target.value)} placeholder="Livros, autores, casos..." />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button
              onClick={() => genMut.mutate("all")}
              disabled={!canGenerate || genMut.isPending}
              size="lg"
            >
              {genMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Gerar curso completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {course && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>2. Preview do rascunho</CardTitle>
              <CardDescription>Revise, regenere partes ou salve como rascunho.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => genMut.mutate("description")} disabled={genMut.isPending}>
                <RotateCw className="mr-1 h-3 w-3" /> Descrição
              </Button>
              <Button variant="outline" size="sm" onClick={() => genMut.mutate("modules")} disabled={genMut.isPending}>
                <RotateCw className="mr-1 h-3 w-3" /> Módulos
              </Button>
              <Button variant="outline" size="sm" onClick={() => genMut.mutate("quiz")} disabled={genMut.isPending}>
                <RotateCw className="mr-1 h-3 w-3" /> Quiz
              </Button>
              <Button variant="outline" size="sm" onClick={() => genMut.mutate("pdf_outline")} disabled={genMut.isPending}>
                <RotateCw className="mr-1 h-3 w-3" /> PDF outline
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Slug" value={course.slug} onChange={(v) => setCourse({ ...course, slug: v })} />
              <Field label="Promessa" value={course.promise} onChange={(v) => setCourse({ ...course, promise: v })} />
              <Field label="Short description" value={course.short_description} onChange={(v) => setCourse({ ...course, short_description: v })} area />
              <Field label="Público refinado" value={course.audience} onChange={(v) => setCourse({ ...course, audience: v })} area />
              <div className="md:col-span-2">
                <Field label="Descrição completa" value={course.full_description} onChange={(v) => setCourse({ ...course, full_description: v })} area rows={5} />
              </div>
            </div>

            {course.learning_outcomes?.length ? (
              <div>
                <Label>Learning outcomes</Label>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {course.learning_outcomes.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
            ) : null}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">Módulos ({course.modules?.length ?? 0})</h3>
              </div>
              <div className="space-y-3">
                {course.modules?.map((m, i) => (
                  <Card key={i} className="border-muted">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="secondary">M{i + 1}</Badge>
                        <Input
                          value={m.title}
                          onChange={(e) => {
                            const arr = [...(course.modules ?? [])];
                            arr[i] = { ...m, title: e.target.value };
                            setCourse({ ...course, modules: arr });
                          }}
                          className="flex-1"
                        />
                        <Badge variant="outline">{m.duration_minutes ?? 20} min</Badge>
                        <Badge variant="outline">{m.quiz?.length ?? 0} q</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      {m.objective && <p><b>Objetivo:</b> {m.objective}</p>}
                      {m.summary && <p><b>Resumo:</b> {m.summary}</p>}
                      {m.practical_activity && <p><b>Prática:</b> {m.practical_activity}</p>}
                      {m.pdf_outline?.length ? (
                        <p><b>PDF:</b> {m.pdf_outline.join(" · ")}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setCourse(null)}>Descartar</Button>
              <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                {saveMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar como rascunho
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, area, rows,
}: { label: string; value?: string; onChange: (v: string) => void; area?: boolean; rows?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      {area ? (
        <Textarea rows={rows ?? 2} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
