import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { EBOOK_CONFIG } from "@/lib/ebook-ia-sem-complicacao/config";

interface FinalCTASectionProps {
  onCtaClick: () => void;
}

export function FinalCTASection({ onCtaClick }: FinalCTASectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Sua jornada começa agora</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Pronto para dominar a Inteligência Artificial?
          </h2>

          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
            Não fique para trás. Milhares de pessoas já estão usando IA para transformar suas vidas. É a sua vez.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onCtaClick}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg text-lg px-12 py-7 rounded-xl group font-semibold"
            >
              Sim, Quero Começar!
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-primary-foreground/70 mt-6 text-sm">
            {EBOOK_CONFIG.priceLabel} • Pagamento único • Garantia de 7 dias
          </p>
        </div>
      </div>
    </section>
  );
}

export default FinalCTASection;
