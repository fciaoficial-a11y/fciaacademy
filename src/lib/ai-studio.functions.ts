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
