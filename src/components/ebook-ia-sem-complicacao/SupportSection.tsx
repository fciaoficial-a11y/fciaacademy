import { MessageCircle, Clock, Shield, Heart } from "lucide-react";

const items = [
  {
    icon: MessageCircle,
    title: "Suporte via WhatsApp",
    description: "Tire suas dúvidas diretamente comigo. Resposta rápida e personalizada para ajudar você em cada passo.",
  },
  {
    icon: Clock,
    title: "Atualizações Gratuitas",
    description: "O mundo da IA evolui rápido. Receba atualizações do guia sem custo adicional sempre que houver novidades.",
  },
  {
    icon: Shield,
    title: "Garantia de 7 Dias",
    description: "Se por qualquer motivo você não gostar do material, devolvemos 100% do seu investimento. Sem perguntas.",
  },
  {
    icon: Heart,
    title: "Comunidade Exclusiva",
    description: "Faça parte de um grupo seleto de pessoas que estão transformando suas vidas com Inteligência Artificial.",
  },
];

export function SupportSection() {
  return (
    <section className="py-20 lg:py-28 bg-card">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Você não está <span className="text-gradient">sozinho</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Suporte e acompanhamento para garantir seu sucesso na jornada com IA
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {items.map((item) => (
              <div key={item.title} className="bg-background rounded-2xl p-8 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportSection;
