import { MessageCircle } from "lucide-react";
import { EBOOK_CONFIG } from "@/lib/ebook-ia-sem-complicacao/config";

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${EBOOK_CONFIG.whatsappNumber}?text=${encodeURIComponent(EBOOK_CONFIG.whatsappMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground px-5 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="font-medium hidden sm:inline group-hover:inline">Fale Conosco</span>
    </a>
  );
}

export default WhatsAppButton;
