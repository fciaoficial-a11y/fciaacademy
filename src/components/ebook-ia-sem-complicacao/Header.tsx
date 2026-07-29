export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/60">
      <div className="container flex items-center justify-between h-16">
        <a href="/ebook-ia-sem-complicacao" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="font-display font-extrabold text-primary-foreground text-sm tracking-tight">FC</span>
            <div className="absolute -inset-px rounded-lg ring-1 ring-inset ring-white/10" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-foreground text-sm tracking-tight">
              FCIA <span className="text-primary">Academy</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
              IA aplicada · Negócios · Execução
            </span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          <span>Produto oficial</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
