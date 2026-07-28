import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/**
 * Sticky CTA mobile-only para rotas públicas de descoberta/conversão.
 * - Altura mínima 48px (área de toque confortável)
 * - Respeita safe-area do iOS (env(safe-area-inset-bottom))
 * - Microcopy padronizada em todas as páginas
 * - Oculto em desktop (lg:hidden)
 */
export function StickyMobileCTA() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Rotas onde o sticky aparece + copy/ação por contexto
  let label = "Ver todos os cursos";
  let href: string | null = "/cursos";
  let scrollTo: string | null = null;

  if (pathname.startsWith("/curso/") && pathname.endsWith("/oferta")) {
    // Página de oferta: leva ao bloco de checkout
    label = "Quero garantir minha vaga";
    href = null;
    scrollTo = "comprar";
  } else if (pathname === "/cursos") {
    // Já no catálogo: convida a explorar cursos populares
    label = "Ver cursos em destaque";
    href = "/cursos";
    scrollTo = null;
  } else if (pathname === "/inscricao") {
    label = "Criar minha conta grátis";
    href = "/register";
  } else if (
    pathname === "/" ||
    pathname === "/empresas" ||
    pathname === "/turmas" ||
    pathname.startsWith("/trilhas")
  ) {
    label = "Ver todos os cursos";
    href = "/cursos";
  } else {
    return null;
  }

  const baseClasses =
    "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-accent to-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/10 transition active:scale-[0.98]";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      role="region"
      aria-label="Ação principal"
    >
      {/* fade suave para não cortar o conteúdo */}
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background to-transparent" />
      <div className="relative border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {scrollTo ? (
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById(scrollTo!);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={baseClasses}
          >
            {label}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : href ? (
          <Link to={href} className={baseClasses}>
            {label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
