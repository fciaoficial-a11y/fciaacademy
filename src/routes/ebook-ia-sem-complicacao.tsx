import { createFileRoute } from "@tanstack/react-router";
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

const PAGE_URL = "https://fciaacademy.lovable.app/ebook-ia-sem-complicacao";
const PAGE_TITLE = "IA Sem Complicação — Guia + Bônus | FCIA Academy";
const PAGE_DESCRIPTION =
  "O guia definitivo para dominar Inteligência Artificial no dia a dia, sem termos técnicos. Ebook + bônus 50 tarefas para vender usando IA por R$ 47,90.";

export const Route = createFileRoute("/ebook-ia-sem-complicacao")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:url", content: PAGE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: EbookLandingPage,
});

function EbookLandingPage() {
  const handleCtaClick = () => {
    window.open(EBOOK_CONFIG.checkoutUrl, "_blank", "noopener,noreferrer");
  };

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
    </main>
  );
}
