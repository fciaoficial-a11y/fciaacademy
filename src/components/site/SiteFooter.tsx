import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display text-[15px] font-semibold tracking-tight">
                FCIA<span className="text-muted-foreground">/</span>Academy
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Plataforma de aprendizado em tecnologia, IA e novos negócios — para pessoas e empresas que querem avançar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
            <FooterCol
              title="Explorar"
              links={[
                { to: "/trilhas", label: "Trilhas" },
                { to: "/cursos", label: "Cursos" },
                { to: "/turmas", label: "Turmas" },
                { to: "/inscricao", label: "Inscrever-se" },
              ]}
            />

            <Separator
              orientation="vertical"
              className="hidden lg:block bg-border/60"
            />

            <FooterCol
              title="Empresas"
              links={[
                { to: "/empresas", label: "Treinamento corporativo" },
                { to: "/empresas", label: "Falar com vendas" },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} FCIA Academy. Todos os direitos reservados.</span>
          <span className="font-mono uppercase tracking-widest">
            v2 · São Paulo · Brasil
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l, i) => (
          <li key={i}>
            <Link
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
