import { Gift, Sparkles } from "lucide-react";
import bonusImage from "@/assets/ebook-ia-sem-complicacao/bonus-cover-official.png.asset.json";

export function BonusSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-section-alt">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-highlight" />
            <span className="text-highlight font-bold text-lg uppercase tracking-wide">Bônus Exclusivo</span>
            <Gift className="w-8 h-8 text-highlight" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            E tem <span className="text-gradient">mais...</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-12">
            Ao adquirir o guia, você também recebe este material complementar:
          </p>

          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-float border border-border relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="bg-gradient-cta text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-glow">
                <Sparkles className="w-4 h-4" />
                GRÁTIS
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-shrink-0">
                <img
                  src={bonusImage.url}
                  alt="Ebook Bônus: 50 Tarefas Simples Que Pode Vender Usando IA"
                  className="w-48 md:w-64 h-auto rounded-xl shadow-2xl"
                  loading="lazy"
                />
              </div>

              <div className="text-left">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  50 Tarefas Simples Que Pode Vender Usando IA
                </h3>

                <p className="text-muted-foreground text-lg mb-6">
                  Lista prática com{" "}
                  <strong className="text-foreground">ideias de serviços fáceis, rápidos e lucrativos</strong> que você
                  pode começar a oferecer hoje mesmo usando inteligência artificial.
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="bg-primary/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-foreground">✓ Ideias prontas para usar</span>
                  </div>
                  <div className="bg-primary/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-foreground">✓ Para iniciantes</span>
                  </div>
                  <div className="bg-primary/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-foreground">✓ Baixo investimento</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className="text-muted-foreground line-through text-lg">R$ 27,00</span>
                  <span className="bg-gradient-cta text-white px-3 py-1 rounded-full font-bold">GRÁTIS</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mt-8">
            🎁 Você leva <strong className="text-foreground">tudo isso</strong> ao adquirir o guia principal!
          </p>
        </div>
      </div>
    </section>
  );
}

export default BonusSection;
