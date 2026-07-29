import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/60">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3 group" aria-label="FCIA Academy — início">
          <Logo size={36} priority />
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.18em] text-muted-foreground border-l border-border/60 pl-3 ml-1">
            IA aplicada · Negócios · Execução
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          <span>Produto oficial</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
