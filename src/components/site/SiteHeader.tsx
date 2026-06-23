import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";

const nav = [
  { to: "/trilhas", label: "Trilhas" },
  { to: "/cursos", label: "Cursos" },
  { to: "/turmas", label: "Turmas" },
  { to: "/empresas", label: "Empresas" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 -z-10 border-b border-white/5 bg-background/60 backdrop-blur-xl backdrop-saturate-150" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
        <Link to="/" className="group flex items-center gap-2.5 justify-self-start">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground ring-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            FCIA<span className="text-muted-foreground/50">/</span>
            <span className="font-medium text-muted-foreground">Academy</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-1 backdrop-blur md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-1.5 text-[13.5px] font-medium text-muted-foreground transition-all hover:text-foreground"
              activeProps={{
                className:
                  "text-foreground bg-white/8 ring-1 ring-inset ring-primary/30",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            to="/login"
            className="hidden rounded-full px-3 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            to="/register"
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-[13.5px] font-semibold text-primary-foreground ring-glow transition-all hover:-translate-y-0.5"
          >
            Criar conta
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

      </div>
    </header>
  );
}
