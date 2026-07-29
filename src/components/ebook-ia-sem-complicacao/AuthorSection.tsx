import { Award, BookOpen } from "lucide-react";
import authorPhoto from "@/assets/ebook-ia-sem-complicacao/author-fernando.jpg.asset.json";

export function AuthorSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src={authorPhoto.url}
                  alt="Fernando Cabral — autor do Guia IA Sem Complicação"
                  className="w-64 h-64 md:w-80 md:h-80 rounded-3xl shadow-float object-cover"
                  loading="lazy"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-xl" />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
              </div>
            </div>

            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" />
                <span>Sobre o Autor</span>
              </div>

              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Fernando Cabral</h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Professor e especialista em tecnologia educacional, Fernando Cabral dedica sua carreira a
                  democratizar o acesso ao conhecimento sobre Inteligência Artificial.
                </p>
                <p>
                  Com anos de experiência ensinando pessoas de todas as idades e níveis técnicos, ele
                  desenvolveu uma metodologia única que torna conceitos complexos em aprendizados simples e
                  aplicáveis.
                </p>
                <p className="font-medium text-foreground">
                  "Minha missão é provar que qualquer pessoa pode dominar a IA — basta ter o guia certo."
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Educador</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Especialista em IA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthorSection;
