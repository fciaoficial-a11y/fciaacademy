export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background border-t border-border">
      <div className="container py-14">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                  <span className="font-display font-extrabold text-primary-foreground text-sm tracking-tight">FC</span>
                </div>
                <div className="leading-none">
                  <p className="font-display font-bold text-foreground tracking-tight">
                    FCIA <span className="text-primary">Academy</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                    IA aplicada · Negócios · Execução
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                <span className="text-foreground font-medium">IA Sem Complicação</span> é um produto oficial da FCIA
                Academy — academy premium de Inteligência Artificial aplicada, negócios e formação prática.
              </p>
            </div>

            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground md:text-right">
              <p>© {currentYear} FCIA Academy</p>
              <p className="mt-1">Fernando Cabral · Todos os direitos reservados</p>
            </div>
          </div>

          <div className="fcia-hairline" />

          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            Este produto não garante a obtenção de resultados. Qualquer referência ao desempenho de uma estratégia não
            deve ser interpretada como garantia de resultados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
