import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Sparkles } from "lucide-react";
import { EBOOK_CONFIG } from "@/lib/ebook-ia-sem-complicacao/config";

export function ConsultingBanner() {
  const handleClick = () => {
    window.open(EBOOK_CONFIG.consultingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-12 lg:py-16 bg-card">
      <div className="container">
        <div className="relative max-w-5xl mx-auto">
          <div className="relative bg-gradient-primary rounded-3xl p-8 md:p-12 overflow-hidden shadow-float">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10 grid lg:grid-cols-[1fr,auto] gap-8 items-center">
              <div className="text-center lg:text-left space-y-5">
                <div className="inline-flex items-center gap-2 bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>Investimento Inteligente</span>
                </div>

                <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground leading-tight">
                  Invista no Conhecimento que{" "}
                  <span className="underline decoration-primary-foreground/40 decoration-wavy underline-offset-4">
                    Multiplica Resultados
                  </span>
                </h3>

                <p className="text-primary-foreground/90 text-lg md:text-xl leading-relaxed max-w-2xl">
                  O guia te dá as bases. A consultoria personalizada potencializa cada aprendizado.
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                  <div className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Aplicação imediata</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Acompanhamento individual</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-4">
                <Button
                  size="lg"
                  onClick={handleClick}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg text-lg px-8 py-6 rounded-xl group font-semibold"
                >
                  Conhecer Consultoria
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-primary-foreground/70 text-sm">Acelere sua jornada com mentoria exclusiva</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConsultingBanner;
