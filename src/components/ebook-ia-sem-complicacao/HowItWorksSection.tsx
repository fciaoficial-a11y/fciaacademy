import { Download, BookOpen, Rocket } from "lucide-react";

const steps = [
  { icon: Download, step: "01", title: "Faça sua compra", description: "Processo 100% seguro. Receba acesso imediato ao material completo" },
  { icon: BookOpen, step: "02", title: "Estude no seu ritmo", description: "Leia em qualquer dispositivo, quando e onde quiser" },
  { icon: Rocket, step: "03", title: "Aplique e transforme", description: "Coloque em prática os aprendizados e veja resultados reais" },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Como <span className="text-gradient">funciona</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em 3 passos simples você começa sua jornada com Inteligência Artificial
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-primary/10" />
              )}

              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-button">
                  <item.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <span className="inline-block text-sm font-bold text-primary mb-3">PASSO {item.step}</span>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
