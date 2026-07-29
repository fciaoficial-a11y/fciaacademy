import { Check, User, Briefcase, GraduationCap, Users } from "lucide-react";

const audiences = [
  { icon: Briefcase, title: "Profissionais", description: "Que querem se destacar no mercado usando tecnologia de ponta" },
  { icon: User, title: "Empreendedores", description: "Que precisam fazer mais com menos tempo e recursos" },
  { icon: GraduationCap, title: "Estudantes", description: "Que querem acelerar o aprendizado e se preparar para o futuro" },
  { icon: Users, title: "Curiosos", description: "Que querem entender IA de forma simples, sem termos técnicos" },
];

export function TargetAudienceSection() {
  return (
    <section className="py-20 lg:py-28 bg-card">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Para <span className="text-gradient">quem</span> é esse guia?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Se você se identifica com algum desses perfis, esse guia foi feito para você
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((item) => (
            <div
              key={item.title}
              className="text-center p-8 rounded-2xl bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-button">
                <item.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center gap-4 text-sm">
            {[
              "Não precisa saber programar",
              "Não precisa ter experiência",
              "Não precisa de equipamento especial",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TargetAudienceSection;
