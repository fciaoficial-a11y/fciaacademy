import { createFileRoute } from "@tanstack/react-router";
import InfluencerCoursePage from "@/routes/_authenticated/course.influencer-com-ia";

export const Route = createFileRoute("/course/influencer-com-ia")({
  head: () => ({
    meta: [
      { title: "Influencer com IA — FCIA Academy" },
      {
        name: "description",
        content:
          "Área do aluno do curso Influencer com IA: videoaulas, material em PDF, checklist de prática e quiz com liberação por nota.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-2xl text-white">Erro ao carregar o curso</h1>
      <p className="mt-2 text-sm text-slate-400">
        {error instanceof Error ? error.message : String(error)}
      </p>
      <a href="/course/influencer-com-ia" className="mt-6 inline-block text-sm text-cyan-300 hover:underline">
        Tentar novamente
      </a>
    </div>
  ),
  component: InfluencerCoursePage,
});
