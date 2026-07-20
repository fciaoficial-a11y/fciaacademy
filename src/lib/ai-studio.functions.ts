import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GENERATORS = {
  course_copy:
    "Você é copywriter especialista em educação. Gere um texto de marketing (título, subtítulo e descrição persuasiva) para o curso descrito. Português do Brasil. Tom profissional e inspirador.",
  learning_objectives:
    "Você é designer instrucional. Gere de 4 a 8 objetivos de aprendizagem claros, mensuráveis (verbos de Bloom) para o curso/módulo descrito. Retorne lista em markdown.",
  module_summary:
    "Você é designer instrucional. Gere um resumo conciso (200-400 palavras) do módulo descrito, em markdown, com pontos-chave.",
  exercises:
    "Você é designer instrucional. Gere de 3 a 6 exercícios práticos sobre o tópico. Inclua enunciado, contexto e critério de sucesso. Markdown.",
  questions:
    'Você é designer instrucional. Gere de 5 a 10 questões de avaliação sobre o tópico. Retorne APENAS JSON válido no formato: {"questions":[{"question":"...","type":"multiple_choice"|"true_false","options":["a","b","c","d"],"correct_answer":"a","explanation":"..."}]}. Para true_false use options ["Verdadeiro","Falso"].',
  certificate_text:
    "Você gera o texto de um certificado de conclusão. Use linguagem formal, mencione conquistas e competências adquiridas. Português do Brasil. 2-3 parágrafos.",
  full_course:
    'Você é arquiteto de cursos. Gere a estrutura completa de um curso. Retorne APENAS JSON válido: {"title":"...","description":"...","objectives":["..."],"modules":[{"title":"...","summary":"...","duration_minutes":30}]}. Crie de 4 a 8 módulos.',
} as const;

export type GeneratorType = keyof typeof GENERATORS;

const Input = z.object({
  type: z.enum(Object.keys(GENERATORS) as [GeneratorType, ...GeneratorType[]]),
  prompt: z.string().min(3).max(4000),
});

export const generateAiContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await (context.supabase as any).rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: GENERATORS[data.type] },
          { role: "user", content: data.prompt },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return { content };
  });

/* ============================================================
 * Course Generator (brief -> full structured course draft)
 * ============================================================ */

const BriefInput = z.object({
  title: z.string().min(3).max(160),
  base_description: z.string().min(10).max(4000),
  track_id: z.string().uuid().nullable().optional(),
  level: z.enum(["Iniciante", "Intermediário", "Avançado"]).default("Iniciante"),
  workload_hours: z.number().int().min(1).max(200).default(4),
  audience: z.string().max(500).optional().default(""),
  main_goal: z.string().max(500).optional().default(""),
  keywords: z.string().max(500).optional().default(""),
  references: z.string().max(2000).optional().default(""),
  tone: z.string().max(200).optional().default("didático, prático, acessível"),
  module_count: z.number().int().min(3).max(12).default(6),
  section: z
    .enum(["all", "description", "modules", "quiz", "pdf_outline"])
    .default("all"),
});

const COURSE_SCHEMA_HINT = `{
  "slug": "kebab-case-do-curso",
  "short_description": "1-2 frases",
  "full_description": "3-5 parágrafos em markdown",
  "promise": "1 frase da promessa central",
  "audience": "público-alvo refinado",
  "prerequisites": ["..."],
  "learning_outcomes": ["verbo de Bloom + resultado", "..."],
  "cover_prompt": "prompt visual em inglês para gerar capa",
  "modules": [
    {
      "title": "...",
      "slug": "kebab-case",
      "objective": "objetivo do módulo",
      "summary": "resumo curto",
      "content_md": "conteúdo didático em markdown (400-900 palavras)",
      "duration_minutes": 30,
      "pdf_outline": ["seção 1", "seção 2"],
      "practical_activity": "atividade prática aplicada",
      "quiz": [
        {
          "question": "...",
          "type": "multiple_choice",
          "options": ["a","b","c","d"],
          "correct_answer": "a",
          "explanation": "..."
        }
      ]
    }
  ]
}`;

function buildCoursePrompt(b: z.infer<typeof BriefInput>) {
  const sectionInstr =
    b.section === "all"
      ? "Gere o curso COMPLETO."
      : b.section === "description"
        ? "Regenere APENAS os campos: slug, short_description, full_description, promise, audience, prerequisites, learning_outcomes, cover_prompt. Use modules: []."
        : b.section === "modules"
          ? "Regenere APENAS o array modules (sem quiz — use quiz: []). Preencha os campos textuais do curso com valores curtos."
          : b.section === "quiz"
            ? "Regenere APENAS o array quiz de cada módulo. Mantenha títulos/summaries curtos, content_md pode ser vazio."
            : "Regenere APENAS o pdf_outline de cada módulo. Outros campos podem ser vazios.";

  return `Brief do curso FCIA Academy:
Título: ${b.title}
Descrição base: ${b.base_description}
Nível: ${b.level}
Carga horária: ${b.workload_hours}h
Público-alvo: ${b.audience || "não informado"}
Objetivo principal: ${b.main_goal || "não informado"}
Palavras-chave: ${b.keywords || "não informado"}
Referências: ${b.references || "não informado"}
Tom didático: ${b.tone}
Quantidade de módulos: ${b.module_count}

${sectionInstr}

Siga a didática FCIA: linguagem acessível, foco em aplicação real, progressão do básico ao prático, evite conteúdo genérico. Cada módulo deve ter 3 a 6 questões de quiz (multiple_choice ou true_false, para true_false use options ["Verdadeiro","Falso"]).

Retorne EXCLUSIVAMENTE um JSON válido, sem markdown, sem texto extra, no formato:
${COURSE_SCHEMA_HINT}`;
}

function stripJsonFences(s: string) {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

async function callGateway(system: string, user: string, apiKey: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${t.slice(0, 200)}`);
  }
  const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return j.choices?.[0]?.message?.content ?? "";
}

export const generateCourseFromBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BriefInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await (context.supabase as any).rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const system =
      "Você é arquiteto de cursos da FCIA Academy. Gera cursos completos, pedagogicamente organizados, em português do Brasil. Responde APENAS com JSON válido.";
    const content = await callGateway(system, buildCoursePrompt(data), apiKey);
    const cleaned = stripJsonFences(content);
    try {
      JSON.parse(cleaned);
    } catch {
      throw new Error("A IA retornou JSON inválido. Tente regenerar.");
    }
    return { courseJson: cleaned };
  });

/* ---------- persistência do rascunho ---------- */

const SaveInput = z.object({
  track_id: z.string().uuid().nullable().optional(),
  title: z.string().min(3),
  level: z.string().default("Iniciante"),
  workload_hours: z.number().int().min(1).default(4),
  course: z.object({
    slug: z.string(),
    short_description: z.string().default(""),
    full_description: z.string().default(""),
    promise: z.string().default(""),
    audience: z.string().default(""),
    prerequisites: z.array(z.string()).default([]),
    learning_outcomes: z.array(z.string()).default([]),
    cover_prompt: z.string().default(""),
    modules: z
      .array(
        z.object({
          title: z.string(),
          slug: z.string().optional().default(""),
          objective: z.string().default(""),
          summary: z.string().default(""),
          content_md: z.string().default(""),
          duration_minutes: z.number().int().default(20),
          pdf_outline: z.array(z.string()).default([]),
          practical_activity: z.string().default(""),
          quiz: z
            .array(
              z.object({
                question: z.string(),
                type: z.enum(["multiple_choice", "true_false"]).default("multiple_choice"),
                options: z.array(z.string()).default([]),
                correct_answer: z.string(),
                explanation: z.string().optional().default(""),
              }),
            )
            .default([]),
        }),
      )
      .default([]),
  }),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export const saveCourseDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveInput.parse(input))
  .handler(async ({ data, context }) => {
    const t0 = Date.now();
    const rid = crypto.randomUUID();
    const log = (evt: string, extra: Record<string, unknown> = {}) =>
      console.info("[saveCourseDraft]", JSON.stringify({ rid, evt, user: context.userId, ...extra }));
    try {
    const { data: isAdmin } = await (context.supabase as any).rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const supa = context.supabase as any;
    const c = data.course;
    const baseSlug = c.slug || slugify(data.title);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    log("start", { title: data.title, slug, modules: c.modules.length });

    const description = [c.promise, c.short_description, c.full_description]
      .filter(Boolean)
      .join("\n\n");

    const { data: inserted, error: courseErr } = await supa
      .from("courses")
      .insert({
        track_id: data.track_id ?? null,
        slug,
        title: data.title,
        description,
        level: data.level,
        workload_hours: data.workload_hours,
        duration_minutes: c.modules.reduce((a, m) => a + (m.duration_minutes || 0), 0),
        is_published: false,
      })
      .select("id")
      .single();
    if (courseErr) { log("course_insert_fail", { err: courseErr.message }); throw new Error(`Erro ao salvar curso: ${courseErr.message}`); }
    const courseId = inserted.id as string;

    for (let i = 0; i < c.modules.length; i++) {
      const m = c.modules[i];
      const modSlug = (m.slug ? slugify(m.slug) : slugify(m.title)) || `modulo-${i + 1}`;
      const contentText = [
        m.objective ? `## Objetivo\n${m.objective}` : "",
        m.summary ? `## Resumo\n${m.summary}` : "",
        m.content_md ? `## Conteúdo\n${m.content_md}` : "",
        m.practical_activity ? `## Atividade prática\n${m.practical_activity}` : "",
        m.pdf_outline?.length ? `## Outline PDF\n${m.pdf_outline.map((x) => `- ${x}`).join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data: modIns, error: modErr } = await supa
        .from("modules")
        .insert({
          course_id: courseId,
          slug: `${modSlug}-${i + 1}`,
          title: m.title,
          description: m.summary || m.objective || "",
          content_type: "text",
          content_text: contentText,
          duration_minutes: m.duration_minutes || 20,
          sort_order: i + 1,
          is_published: false,
        })
        .select("id")
        .single();
      if (modErr) throw new Error(`Erro no módulo ${i + 1}: ${modErr.message}`);
      const moduleId = modIns.id as string;

      if (m.quiz?.length) {
        const rows = m.quiz.map((q, qi) => ({
          module_id: moduleId,
          question: q.question,
          type: q.type,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation || null,
          sort_order: qi + 1,
        }));
        const { error: qErr } = await supa.from("questions").insert(rows);
        if (qErr) throw new Error(`Erro nas questões do módulo ${i + 1}: ${qErr.message}`);
      }
    }

    log("done", { course_id: courseId, slug, ms: Date.now() - t0 });
    return { course_id: courseId, slug };
    } catch (err) {
      console.error("[saveCourseDraft]", JSON.stringify({ rid, ok: false, ms: Date.now() - t0, error: err instanceof Error ? err.message : String(err) }));
      throw err;
    }
  });

/* ============================================================
 * Question Bank Generator (module or course → persistent bank)
 * ============================================================ */

const BankInput = z.object({
  course_id: z.string().uuid(),
  module_id: z.string().uuid().nullable().optional(),
  count: z.number().int().min(3).max(30).default(8),
  difficulty_mix: z.boolean().default(true),
  source_type: z.enum(["apostila", "modulo", "curso", "ai", "manual"]).default("ai"),
  auto_approve: z.boolean().default(false),
  extra_context: z.string().max(4000).optional().default(""),
});

export const generateQuestionBank = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BankInput.parse(input))
  .handler(async ({ data, context }) => {
    const t0 = Date.now();
    const rid = crypto.randomUUID();
    const log = (evt: string, extra: Record<string, unknown> = {}) =>
      console.info("[generateQuestionBank]", JSON.stringify({ rid, evt, user: context.userId, course: data.course_id, ...extra }));
    try {
    const supa = context.supabase as any;
    const { data: isAdmin } = await supa.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Buscar contexto real do curso/módulo
    const { data: course } = await supa
      .from("courses")
      .select("id, title, description")
      .eq("id", data.course_id)
      .maybeSingle();
    if (!course) throw new Error("Curso não encontrado.");

    let modules: Array<{ id: string; title: string; content_text: string | null }> = [];
    if (data.module_id) {
      const { data: m } = await supa
        .from("modules")
        .select("id, title, content_text")
        .eq("id", data.module_id)
        .maybeSingle();
      if (m) modules = [m];
    } else {
      const { data: ms } = await supa
        .from("modules")
        .select("id, title, content_text")
        .eq("course_id", data.course_id)
        .order("sort_order");
      modules = ms ?? [];
    }
    if (!modules.length) throw new Error("Nenhum módulo encontrado para gerar questões.");

    const contextText = modules
      .map((m) => `## Módulo: ${m.title}\n${(m.content_text || "").slice(0, 2000)}`)
      .join("\n\n");

    const perModule = Math.max(3, Math.ceil(data.count / modules.length));
    const system =
      "Você é designer instrucional da FCIA Academy. Gere questões didáticas, aplicadas, com alternativas plausíveis. Responda APENAS com JSON válido.";
    const mixInstr = data.difficulty_mix
      ? 'Distribua entre "easy", "medium" e "hard".'
      : 'Use "medium" para todas.';
    const user = `Curso: ${course.title}
Descrição: ${course.description || ""}
Contexto adicional: ${data.extra_context || "n/d"}

Conteúdo pedagógico:
${contextText}

Gere EXATAMENTE ${perModule} questões POR MÓDULO listado acima (identificado pelo título). ${mixInstr}
Cada questão deve ser respondível a partir do conteúdo. Alternativas plausíveis, uma única correta.
Formato JSON estrito:
{"questions":[{"module_title":"...","topic":"...","difficulty":"easy|medium|hard","question":"...","type":"multiple_choice|true_false","options":["a","b","c","d"],"correct_answer":"a","explanation":"..."}]}
Para true_false use options ["Verdadeiro","Falso"].`;

    const content = await callGateway(system, user, apiKey);
    let parsed: any;
    try {
      parsed = JSON.parse(stripJsonFences(content));
    } catch {
      throw new Error("A IA retornou JSON inválido.");
    }
    const items: any[] = Array.isArray(parsed?.questions) ? parsed.questions : [];
    if (!items.length) throw new Error("A IA não retornou questões.");

    // Mapear module_title -> id
    const byTitle = new Map(modules.map((m) => [m.title.toLowerCase().trim(), m.id]));

    const rows = items
      .map((q, i) => {
        const modId =
          byTitle.get(String(q.module_title || "").toLowerCase().trim()) ??
          data.module_id ??
          modules[0].id;
        const type = q.type === "true_false" ? "true_false" : "multiple_choice";
        const options =
          type === "true_false"
            ? ["Verdadeiro", "Falso"]
            : Array.isArray(q.options)
              ? q.options.filter(Boolean).slice(0, 6)
              : [];
        if (!q.question || !q.correct_answer || options.length < 2) return null;
        const diff = ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium";
        return {
          course_id: data.course_id,
          module_id: modId,
          question: String(q.question).slice(0, 1000),
          type,
          options,
          correct_answer: String(q.correct_answer),
          explanation: q.explanation ? String(q.explanation).slice(0, 1000) : null,
          difficulty: diff,
          topic: q.topic ? String(q.topic).slice(0, 120) : null,
          source_type: data.source_type,
          status: data.auto_approve ? "approved" : "draft",
          sort_order: 1000 + i,
        };
      })
      .filter(Boolean);

    if (!rows.length) throw new Error("Nenhuma questão válida gerada.");
    const { error } = await supa.from("questions").insert(rows);
    if (error) { log("insert_fail", { err: error.message }); throw new Error(`Erro ao salvar: ${error.message}`); }

    log("done", { inserted: rows.length, auto_approved: data.auto_approve, ms: Date.now() - t0 });
    return { inserted: rows.length, auto_approved: data.auto_approve };
    } catch (err) {
      console.error("[generateQuestionBank]", JSON.stringify({ rid, ok: false, ms: Date.now() - t0, error: err instanceof Error ? err.message : String(err) }));
      throw err;
    }
  });

