import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Gift, Package } from "lucide-react";
import ebookCover from "@/assets/ebook-ia-sem-complicacao/ebook-cover-official.png.asset.json";
import bonusImage from "@/assets/ebook-ia-sem-complicacao/bonus-cover-official.png.asset.json";
import { EBOOK_CONFIG } from "@/lib/ebook-ia-sem-complicacao/config";

// Ex.: "R$ 37,90" → { integer: "37", decimals: "90" }
const priceMatch = EBOOK_CONFIG.priceLabel.match(/(\d+)[.,](\d{2})/);
const PRICE_INT = priceMatch?.[1] ?? "37";
const PRICE_DEC = priceMatch?.[2] ?? "90";

interface OfferSectionProps {
  onCtaClick: () => void;
}

export function OfferSection({ onCtaClick }: OfferSectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Invista no seu <span className="text-gradient">futuro</span>
          </h2>

          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-float border border-border">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-8">
              <div className="text-center">
                <img
                  src={ebookCover.url}
                  alt="Capa do ebook IA Sem Complicação"
                  className="w-40 md:w-48 h-auto mx-auto drop-shadow-2xl"
                  loading="lazy"
                />
                <p className="text-sm text-muted-foreground mt-2">Guia Principal</p>
              </div>

              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-cta text-white font-bold text-2xl shadow-glow">
                +
              </div>

              <div className="text-center relative">
                <div className="absolute -top-2 -right-2 bg-gradient-cta text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                  GRÁTIS
                </div>
                <img
                  src={bonusImage.url}
                  alt="Ebook Bônus: 50 Tarefas"
                  className="w-32 md:w-40 h-auto mx-auto rounded-lg shadow-xl"
                  loading="lazy"
                />
                <p className="text-sm text-muted-foreground mt-2">Bônus</p>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Você recebe:</span>
              </div>
              <p className="text-muted-foreground text-sm">
                IA Sem Complicação + 50 Tarefas Simples Que Pode Vender Usando IA
              </p>
            </div>

            <div className="mb-8">
              <p className="text-muted-foreground mb-2">Tudo isso por apenas</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl text-muted-foreground">R$</span>
                <span className="font-display text-6xl md:text-7xl font-extrabold text-gradient">{PRICE_INT}</span>
                <span className="text-2xl text-muted-foreground">,{PRICE_DEC}</span>
              </div>
              <p className="text-muted-foreground mt-2">Pagamento único • Acesso vitalício</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Acesso imediato</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Garantia 7 dias</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Bônus incluso</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={onCtaClick}
              className="bg-gradient-cta hover:opacity-90 shadow-glow text-lg px-12 py-7 rounded-xl group w-full md:w-auto"
            >
              Quero Meu Guia + Bônus Agora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-sm text-muted-foreground mt-6">🔒 Compra 100% segura • Ambiente criptografado</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OfferSection;
