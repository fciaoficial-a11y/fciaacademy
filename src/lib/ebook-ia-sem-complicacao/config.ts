/**
 * Configuração externa da landing /ebook-ia-sem-complicacao.
 *
 * Ponto único para: identidade do produto na plataforma, WhatsApp e
 * link da consultoria. O checkout deixou de ser externo (Kiwify): a compra
 * roda agora pelo fluxo PIX nativo da FCIA Academy — ver EbookLandingPage
 * e /ebook-ia-sem-complicacao/entrega.
 */
export const EBOOK_CONFIG = {
  /** Slug do produto no catálogo interno (tabela `courses`, product_type='ebook'). */
  courseSlug: "ia-sem-complicacao",
  /** Número do WhatsApp (formato internacional, sem "+" nem espaços). */
  whatsappNumber: "5594999553574",
  /** Mensagem pré-preenchida ao abrir o WhatsApp. */
  whatsappMessage: "quero o guia!",
  /** Link externo para o serviço de consultoria/mentoria. */
  consultingUrl: "https://proffernandocabral.lovable.app/",
  /** Preço exibido em CTAs e no rodapé da oferta. */
  priceLabel: "R$ 5,00",
} as const;

export type EbookConfig = typeof EBOOK_CONFIG;
