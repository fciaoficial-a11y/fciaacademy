import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Preciso ter conhecimento técnico para usar o guia?",
    answer:
      "Não! O guia foi criado justamente para pessoas sem conhecimento técnico. Explico tudo de forma simples e prática, como se estivesse conversando com você.",
  },
  {
    question: "O guia serve para qual ferramenta de IA?",
    answer:
      "O guia aborda as principais ferramentas do mercado como ChatGPT, Gemini, e outras. Os conceitos e técnicas que você aprende podem ser aplicados em qualquer ferramenta de IA generativa.",
  },
  {
    question: "Por quanto tempo terei acesso ao material?",
    answer:
      "Seu acesso é vitalício! Uma vez adquirido, o guia é seu para sempre. Além disso, você recebe todas as atualizações futuras sem custo adicional.",
  },
  {
    question: "Como recebo o guia após a compra?",
    answer:
      "Imediatamente após a confirmação do pagamento, você recebe um e-mail com o link para download do material. O acesso é instantâneo!",
  },
  {
    question: "E se eu não gostar do material?",
    answer:
      "Você tem 7 dias de garantia incondicional. Se por qualquer motivo não ficar satisfeito, basta entrar em contato que devolvemos 100% do seu investimento.",
  },
  {
    question: "O guia vai me ajudar a ganhar dinheiro com IA?",
    answer:
      "O guia te ensina a usar IA para ser mais produtivo e eficiente em qualquer área. Muitos alunos usam esse conhecimento para melhorar no trabalho, criar conteúdo, ou até iniciar novos negócios.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Perguntas <span className="text-gradient">Frequentes</span>
            </h2>
            <p className="text-lg text-muted-foreground">Tire suas dúvidas antes de começar</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-card"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
