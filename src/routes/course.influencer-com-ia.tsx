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
  component: InfluencerCoursePage,
});
