import { MessageCircle } from "lucide-react";

const PHONE = "5594999553574";
const MESSAGE = "Olá! Vim pelo site da FCIA Academy.";

export function WhatsAppFloat() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-24 right-4 z-[60] group sm:bottom-5 sm:right-5"
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-70 blur-lg animate-pulse" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground shadow-xl ring-2 ring-white/20 transition-transform group-hover:scale-110">
        <MessageCircle className="h-7 w-7" />
      </span>
    </a>
  );
}
