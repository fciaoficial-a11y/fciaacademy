import { BookOpen, Zap, Target, MessageSquare, FileText, Lightbulb } from "lucide-react";

const learnings = [
  {
    icon: MessageSquare,
    title: "Dominar prompts eficientes",
    description: "Aprenda a conversar com a IA de forma que ela entenda exatamente o que você precisa",
  },
  {
    icon: FileText,
    title: "Criar conteúdos rapidamente",
    description: "Textos, apresentações, e-mails profissionais em minutos, não horas",
  },
  {
    icon: Zap,
    title: "Automatizar tarefas repetitivas",
    description: "Libere tempo para o que realmente importa delegando para a IA",
  },
  {
    icon: Target,
    title: "Resolver problemas complexos",
    description: "Use a IA como seu assistente pessoal para análises e decisões",
  },
  {
    icon: BookOpen,
    title: "Aprender mais rápido",
    description: "Transforme a IA em seu tutor particular para qualquer assunto",
  },
  {
    icon: Lightbulb,
    title: "Ter ideias criativas",
    description: "Desbloqueie sua criatividade com brainstorms inteligentes",
  },
];

export function LearningSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-section-alt relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary/10 rounded-full" />
      <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-accent/10 rotate-45" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            O que você vai <span className="text-gradient">aprender</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Habilidades práticas que você pode aplicar imediatamente no trabalho e na vida pessoal
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {learnings.map((item) => (
            <div
              key={item.title}
              className="group bg-card p-6 lg:p-8 rounded-2xl shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-2 border border-border hover:border-primary/30"
            >
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                <item.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LearningSection;
