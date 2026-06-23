import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function MobileStickyCTA() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="pointer-events-auto mx-auto max-w-md rounded-full border border-primary/30 bg-background/85 p-1.5 shadow-2xl shadow-primary/30 backdrop-blur-xl">
        <Link
          to="/inscricao"
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground"
        >
          Começar gratuitamente
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
