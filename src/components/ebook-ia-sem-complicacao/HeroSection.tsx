import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import ebookMockup from "@/assets/ebook-ia-sem-complicacao/ebook-phone-rainbow.jpeg.asset.json";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white/30 rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-accent/30 rotate-45" />
          <div className="absolute bottom-40 left-1/4 w-16 h-16 border-2 border-white/20 rounded-full" />
        </div>

        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-primary/25 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-highlight/20 rounded-full blur-3xl animate-shimmer" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container relative z-10 pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-sm text-foreground/90 px-4 py-2 rounded-full text-[11px] font-medium border border-white/10 uppercase tracking-[0.18em]">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Produto oficial FCIA Academy</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
              Domine a <span className="text-gradient-light">Inteligência Artificial</span>
              <br />
              Sem Complicação
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0">
              Aprenda a usar IA no seu dia a dia de forma simples e prática. Transforme sua produtividade
              sem precisar ser um expert em tecnologia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={onCtaClick}
                className="bg-gradient-cta hover:opacity-95 shadow-button text-lg px-8 py-6 rounded-xl group text-primary-foreground font-semibold"
              >
                Quero Começar Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onCtaClick}
                className="text-lg px-8 py-6 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50"
              >
                Ver Conteúdo Completo
              </Button>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                <span>Acesso imediato</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                <span>Garantia de 7 dias</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-accent/40 rounded-3xl blur-2xl scale-110" />
              <img
                src={ebookMockup.url}
                alt="Guia IA Sem Complicação — mockup no celular"
                className="relative w-64 md:w-80 h-auto rounded-3xl shadow-float border-2 border-white/20"
                loading="eager"
              />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-highlight/30 rounded-full blur-xl animate-pulse-slow" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-accent/40 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(220 45% 7%)"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
