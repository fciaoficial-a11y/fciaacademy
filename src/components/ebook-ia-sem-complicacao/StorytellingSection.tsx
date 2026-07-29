import ebookForbes from "@/assets/ebook-ia-sem-complicacao/ebook-phone-forbes.jpeg.asset.json";

export function StorytellingSection() {
  return (
    <section className="py-20 lg:py-28 bg-card">
      <div className="container max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 via-accent/10 to-highlight/20 rounded-3xl blur-2xl" />
            <img
              src={ebookForbes.url}
              alt="Guia IA Sem Complicação — leitura editorial no celular"
              className="relative w-full max-w-md mx-auto h-auto rounded-3xl shadow-float border border-white/10"
              loading="lazy"
            />
            <div className="absolute -top-3 -left-3 bg-background/90 backdrop-blur border border-border px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
              Leitura em 1 tarde
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8 text-center lg:text-left">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Você já se sentiu <span className="text-gradient">perdido</span> com tanta informação sobre IA?
            </h2>

            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Todo mundo fala sobre ChatGPT, Gemini, Copilot... mas poucos explicam de forma{" "}
                <strong className="text-foreground">simples e prática</strong> como usar essas ferramentas no dia a dia.
              </p>

              <p>
                Você não precisa ser programador. Não precisa entender de código. Não precisa gastar horas
                assistindo tutoriais intermináveis.
              </p>

              <p className="text-foreground font-medium text-xl">
                O que você precisa é de um <span className="text-gradient font-bold">guia direto ao ponto</span>, feito
                por quem entende suas dificuldades.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 bg-primary/10 px-6 py-4 rounded-2xl">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <p className="text-left">
                <span className="font-semibold text-foreground">Imagine</span>
                <br />
                <span className="text-muted-foreground">Usar IA para economizar horas de trabalho todos os dias</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StorytellingSection;
