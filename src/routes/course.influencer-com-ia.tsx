import { createFileRoute } from "@tanstack/react-router";
import InfluencerCoursePage from "@/routes/_authenticated/course.influencer-com-ia";

export const Route = createFileRoute("/course/influencer-com-ia")({
  component: InfluencerCoursePage,
});
