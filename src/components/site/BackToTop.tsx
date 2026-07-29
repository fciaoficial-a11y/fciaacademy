import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Voltar ao topo"
      className={`fixed bottom-5 left-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground shadow-xl ring-2 ring-white/20 transition-all duration-300 hover:scale-110 sm:left-5 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
}
