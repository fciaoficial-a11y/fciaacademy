import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { FAQ } from "@/components/site/FAQ";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/home-hero-masterclass.jpeg.asset.json";
import courseImage from "@/assets/course-ai.webp.asset.json";
import professorImage from "@/assets/fernando-cabral.webp.asset.json";
import ebookMockup from "@/assets/ebook-ia-sem-complicacao/ebook-mockup.jpeg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FCIA Academy — Aprenda IA de um jeito simples e prático" },
      {
        name: "description",
        content:
          "Conteúdos diretos para quem quer entender inteligência artificial e aplicar no trabalho, nos estudos ou no próprio negócio.",
      },
      { property: "og:title", content: "FCIA Academy — IA prática para a vida real" },
      {
        property: "og:description",
        content:
          "Cursos práticos de IA com certificado ao concluir. Comece pela FCIA Academy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://fciaacademy.lovable.app/" },
      {
        property: "og:image",
        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",
      },
      { property: "og:image:width", content: "1920" },
      { property: "og:image:height", content: "1080" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://fciaacademy.lovable.app/__l5e/assets-v1/f0297b16-f2d1-403a-b4b7-1d779f3614bc/fcia-og-preview.jpg",
      },
    ],
    links: [{ rel: "canonical", href: "https://fciaacademy.lovable.app/" }],
  }),
  component: Index,
});
// ---------------- Featured courses query ----------------
type FeaturedCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  workload_hours: number | null;
  duration_minutes: number | null;
  price: number | null;
  certificate_enabled: boolean | null;
  modules_count: number;
};
const fea