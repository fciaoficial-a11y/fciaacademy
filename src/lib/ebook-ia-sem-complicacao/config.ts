/**
 * Configuração externa da landing /ebook-ia-sem-complicacao.
 *
 * Mantém checkout, WhatsApp e link de consultoria em um único ponto para
 * evitar hardcode nos componentes migrados do projeto "Renda Extra IA".
 */
export const EBOOK_CONFIG = {
  /** URL do checkout externo (Kiwify) do produto principal. */
  checkoutUrl: "https://pay.kiwify.com.br/ksSJFM5",
  /** Número do WhatsApp (formato internacional, sem "+" nem espaços). */
  whatsappNumber: "5594999553574",
  /** Mensagem pré-preenchida ao abrir o WhatsApp. */
  whatsappMessage: "quero o guia!",
  /** Link externo para o serviço de consultoria/mentoria. */
  consultingUrl: "https://proffernandocabral.lovable.app/",
  /** Preço exibido em CTAs e no rodapé da oferta. */
  priceLabel: "R$ 47,90",
} as const;

export type EbookConfig = typeof EBOOK_CONFIG;
