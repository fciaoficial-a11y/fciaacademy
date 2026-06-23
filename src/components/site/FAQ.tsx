import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, SectionHeading } from "@/components/site/Section";

export type FAQItem = { q: string; a: string };

const defaultItems: FAQItem[] = [
  {
    q: "Como funciona o acesso aos cursos?",
    a: "Você tem acesso vitalício ao conteúdo da trilha contratada, incluindo atualizações futuras e comunidade de alunos.",
  },
  {
    q: "Preciso ter conhecimento prévio em tecnologia ou IA?",
    a: "Não. As trilhas começam do zero e evoluem progressivamente. Você só precisa de vontade de aplicar.",
  },
  {
    q: "Tem certificado?",
    a: "Sim. Cada trilha gera um certificado verificável ao concluir os módulos práticos.",
  },
  {
    q: "Como funciona a mentoria ao vivo?",
    a: "Encontros semanais com especialistas, gravados e disponíveis em até 24h para quem não puder participar ao vivo.",
  },
  {
    q: "Posso cancelar?",
    a: "Você tem 7 dias de garantia incondicional. Se não fizer sentido, devolvemos 100% do valor.",
  },
  {
    q: "A FCIA atende empresas?",
    a: "Sim. Oferecemos plataforma white-label, trilhas customizadas, mentoria dedicada e relatórios de progresso para times.",
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
