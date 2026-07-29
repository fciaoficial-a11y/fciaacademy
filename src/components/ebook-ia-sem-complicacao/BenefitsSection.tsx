import { Clock, TrendingUp, Brain, Shield } from "lucide-react";

const benefits = [
  { icon: Clock, title: "Economize tempo", description: "Automatize tarefas e ganhe horas por semana" },
  { icon: TrendingUp, title: "Aumente produtividade", description: "Faça mais em menos tempo com assistência inteligente" },
  { icon: Brain, title: "Aprenda continuamente", description: "Use IA como seu tutor pessoal 24/7" },
  { icon: Shield, title: "Destaque-se no mercado", description: "Desenvolva habilidades que poucos dominam" },
];

export function BenefitsSection() {
  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            O que você será <span className="text-gradient">capaz de fazer</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transformações práticas que você vai experimentar depois de ler o guia
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="group flex items-start gap-5 p-6 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-card transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <item.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
