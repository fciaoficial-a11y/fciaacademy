import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import "./ebook-ia-sem-complicacao/ebook-landing.css";

import { AnimatedSection } from "@/components/ebook-ia-sem-complicacao/AnimatedSection";
import { AuthorSection } from "@/components/ebook-ia-sem-complicacao/AuthorSection";
import { BenefitsSection } from "@/components/ebook-ia-sem-complicacao/BenefitsSection";
import { BonusSection } from "@/components/ebook-ia-sem-complicacao/BonusSection";
import { ConsultingBanner } from "@/components/ebook-ia-sem-complicacao/ConsultingBanner";
import { FAQSection } from "@/components/ebook-ia-sem-complicacao/FAQSection";
import { FinalCTASection } from "@/components/ebook-ia-sem-complicacao/FinalCTASection";
import { Footer } from "@/components/ebook-ia-sem-complicacao/Footer";
import { Header } from "@/components/ebook-ia-sem-complicacao/Header";
import { HeroSection } from "@/components/ebook-ia-sem-complicacao/HeroSection";
import { HowItWorksSection } from "@/components/ebook-ia-sem-complicacao/HowItWorksSection";
import { LearningSection } from "@/components/ebook-ia-sem-complicacao/LearningSection";
import { OfferSection } from "@/components/ebook-ia-sem-complicacao/OfferSection";
import { StorytellingSection } from "@/components/ebook-ia-sem-complicacao/StorytellingSection";
import { SupportSection } from "@/components/ebook-ia-sem-complicacao/SupportSection";
import { TargetAudienceSection } from "@/components/ebook-ia-sem-complicacao/TargetAudienceSection";
import { WhatsAppButton } from "@/components/ebook-ia-sem-complicacao/WhatsAppButton";
import { EBOOK_CONFIG } from "@/lib/ebook-ia-sem-complicacao/config";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PixCheckout } from "@/components/payments/PixCheckout";
import ogImage from "@/assets/ebook-ia-sem-complicacao/og-image.jpg.asset.json";

const SITE_ORIGIN = "https://fciaacademy.lovable.app";
const PAGE_URL = `${SITE_ORIGIN}/ebook-ia-sem-complicacao`;
const PAGE_TITLE = "IA Sem Complicação — Guia + Bônus | FCIA Academy";
const PAGE_DESCRIPTION =
  "O guia definitivo para dominar Inteligência Artificial no dia a dia, sem termos técnicos. Ebook + bônus 50 tarefas para vender usando IA por R$ 37,90.";
const OG_IMAGE_URL = `${SITE_ORIGIN}${ogImage.url}`;

export const Route = createFileRoute("/ebook-ia-sem-complicacao")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:url", content: PAGE_URL },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: EbookLandingPage,
});

function EbookLandingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Produto interno (courses, product_type='ebook').
  const productQuery = useQuery({
    queryKey: ["ebook-product", EBOOK_CONFIG.courseSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, slug, price, is_published")
        .eq("slug", EBOOK_CONFIG.courseSlug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleCtaClick = () => {
    // Deslogado → login com retorno para a landing.
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { redirect: "/ebook-ia-sem-complicacao" } });
      return;
    }
    // Já matriculado → ir direto para entrega. Verificação forte fica na página /entrega.
    if (user && productQuery.data) {
      setCheckoutOpen(true);
    }
  };

  const product = productQuery.data;

  return (
    <main className="ebook-landing min-h-screen">
      <Header />
      <HeroSection onCtaClick={handleCtaClick} />
      <AnimatedSection><StorytellingSection /></AnimatedSection>
      <AnimatedSection><LearningSection /></AnimatedSection>
      <AnimatedSection><TargetAudienceSection /></AnimatedSection>
      <AnimatedSection><AuthorSection /></AnimatedSection>
      <AnimatedSection><ConsultingBanner /></AnimatedSection>
      <AnimatedSection><HowItWorksSection /></AnimatedSection>
      <AnimatedSection><BenefitsSection /></AnimatedSection>
      <AnimatedSection><BonusSection /></AnimatedSection>
      <AnimatedSection><OfferSection onCtaClick={handleCtaClick} /></AnimatedSection>
      <AnimatedSection><SupportSection /></AnimatedSection>
      <AnimatedSection><FAQSection /></AnimatedSection>
      <AnimatedSection><FinalCTASection onCtaClick={handleCtaClick} /></AnimatedSection>
      <Footer />
      <WhatsAppButton />

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compra do ebook via PIX</DialogTitle>
          </DialogHeader>
          {product && (
            <PixCheckout
              mode="course"
              courseId={product.id}
              title={product.title}
              onPaid={() => {
                setCheckoutOpen(false);
                navigate({ to: "/ebook-ia-sem-complicacao/entrega" });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
