import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, SectionHeading } from "@/components/site/Section";

export type FAQItem = { q: string; a: string };

const defaultItems: FAQItem[] = [
  {
    q: "Os cursos são gratuitos ou pagos?",
    a: "Todos os cursos publicados na FCIA Academy são pagos, com compra avulsa por curso. Você paga uma vez pelo curso escolhido e libera o acesso imediatamente após a confirmação do PIX.",
  },
  {
    q: "Como funciona o acesso após a compra?",
    a: "Assim que o pagamento via PIX é confirmado, sua matrícula é liberada automaticamente e você passa a ter acesso vitalício ao curso comprado, incluindo vídeos, PDFs, materiais complementares e atualizações futuras.",
  },
  {
    q: "Preciso ter conhecimento prévio em tecnologia ou IA?",
    a: "Não. Os cursos começam do zero e evoluem progressivamente. Você só precisa de vontade de aplicar no seu contexto profissional.",
  },
  {
    q: "Tem certificado?",
    a: "Sim. Ao concluir 100% dos módulos e ser aprovado no exame final com no mínimo 70% de acerto, você emite um certificado digital verificável por código público e QR Code.",
  },
  {
    q: "Comprar um curso dá acesso a todos os outros?",
    a: "Não. Cada curso é uma compra independente. Você adquire apenas o curso escolhido e pode comprar outros separadamente quando quiser.",
  },
  {
    q: "Posso cancelar ou pedir reembolso?",
    a: "Você tem 7 dias de garantia incondicional a partir da compra. Se o curso não fizer sentido para você, devolvemos 100% do valor pago.",
  },
];

export function FAQ({
  items = defaultItems,
  eyebrow = "Perguntas frequentes",
  title = "Tire suas dúvidas antes de começar.",
  description,
}: {
  items?: FAQItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Section className="border-b border-border !py-12 sm:!py-20 lg:!py-28">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <Accordion type="single" collapsible defaultValue="item-0" className="w-full divide-y divide-border rounded-2xl border border-border bg-background px-4 sm:px-7">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-0">
              <AccordionTrigger className="min-h-14 py-5 text-left text-base font-medium hover:no-underline sm:text-lg">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 pt-0 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
