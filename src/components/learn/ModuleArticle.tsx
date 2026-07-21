import { useMemo, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Target,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Padrão editorial FCIA Academy.
 * Divide markdown por headings H2 e renderiza cada seção como um bloco visual
 * separado (card). Detecta rótulos-chave (Objetivo, Exemplo, Erros, Fechamento,
 * Transição) e aplica estilo/ícone contextual.
 *
 * Este componente é a REGRA GLOBAL de renderização de conteúdo de módulo:
 * qualquer curso novo herda automaticamente esta apresentação.
 */

type BlockKind =
  | "objetivo"
  | "exemplo"
  | "erros"
  | "fechamento"
  | "transicao"
  | "default";

type Block = {
  title: string;
  body: string;
  kind: BlockKind;
};

function classify(title: string): BlockKind {
  const t = title.toLowerCase();
  if (/(objetivo|meta do m[oó]dulo)/.test(t)) return "objetivo";
  if (/(exemplo|caso pr[aá]tico|na pr[aá]tica|aplica[cç][aã]o real)/.test(t))
    return "exemplo";
  if (/(erro|arma[dt]ilha|evite|cuidado)/.test(t)) return "erros";
  if (/(fechamento|conclus[aã]o|resumo|encerramento)/.test(t))
    return "fechamento";
  if (/(transi[cç][aã]o|pr[oó]ximo m[oó]dulo|a seguir)/.test(t))
    return "transicao";
  return "default";
}

function splitByH2(md: string): { intro: string; blocks: Block[] } {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const introLines: string[] = [];
  let current: Block | null = null;

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      if (current) blocks.push(current);
      const title = m[1].replace(/[:.!?]+$/, "").trim();
      current = { title, body: "", kind: classify(title) };
      continue;
    }
    if (current) current.body += line + "\n";
    else introLines.push(line);
  }
  if (current) blocks.push(current);
  return { intro: introLines.join("\n").trim(), blocks };
}

const kindStyles: Record<
  BlockKind,
  { ring: string; icon: ReactNode; label: string; accent: string }
> = {
  objetivo: {
    ring: "ring-1 ring-inset ring-primary/40 bg-gradient-to-br from-primary/[0.08] to-transparent",
    icon: <Target className="h-4 w-4" />,
    label: "Objetivo do módulo",
    accent: "text-primary",
  },
  exemplo: {
    ring: "ring-1 ring-inset ring-sky-500/30 bg-gradient-to-br from-sky-500/[0.06] to-transparent",
    icon: <Lightbulb className="h-4 w-4" />,
    label: "Exemplo prático",
    accent: "text-sky-700 dark:text-sky-300",
  },
  erros: {
    ring: "ring-1 ring-inset ring-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] to-transparent",
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Erros comuns",
    accent: "text-amber-700 dark:text-amber-300",
  },
  fechamento: {
    ring: "ring-1 ring-inset ring-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] to-transparent",
    icon: <Sparkles className="h-4 w-4" />,
    label: "Fechamento",
    accent: "text-emerald-700 dark:text-emerald-300",
  },
  transicao: {
    ring: "ring-1 ring-inset ring-violet-500/30 bg-gradient-to-br from-violet-500/[0.06] to-transparent",
    icon: <ArrowRight className="h-4 w-4" />,
    label: "Próximo passo",
    accent: "text-violet-700 dark:text-violet-300",
  },
  default: {
    ring: "ring-1 ring-inset ring-border/60",
    icon: <BookOpen className="h-4 w-4" />,
    label: "",
    accent: "text-foreground",
  },
};

const mdComponents: Components = {
  h1: ({ children }) => (
    <h3 className="mt-6 mb-3 font-display text-xl font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-5 mb-2 font-display text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h4>
  ),
  h4: ({ children }) => (
    <h5 className="mt-4 mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h5>
  ),
  p: ({ children }) => (
    <p className="my-3 leading-relaxed text-foreground/90">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 space-y-1.5 pl-5 list-disc marker:text-primary/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 space-y-1.5 pl-5 list-decimal marker:text-primary/60">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-primary/50 pl-4 italic text-foreground/80">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border/60" />,
  img: ({ src, alt }) => (
    <img
      src={src as string}
      alt={alt ?? ""}
      loading="lazy"
      className="my-5 w-full rounded-xl border border-border/60"
    />
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono text-primary">
      {children}
    </code>
  ),
};

function BlockCard({ block }: { block: Block }) {
  const s = kindStyles[block.kind];
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card/70 p-6 sm:p-8 backdrop-blur-sm",
        s.ring,
      )}
    >
      <div className={cn("flex items-center gap-2 text-xs font-medium uppercase tracking-widest", s.accent)}>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/60 ring-1 ring-inset ring-border/50">
          {s.icon}
        </span>
        <span>{s.label || "Seção"}</span>
      </div>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
        {block.title}
      </h2>
      <div className="mt-4 max-w-[68ch] text-[15px] sm:text-base">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {block.body.trim()}
        </ReactMarkdown>
      </div>
    </section>
  );
}

export function ModuleArticle({ markdown }: { markdown: string }) {
  const { intro, blocks } = useMemo(() => splitByH2(markdown), [markdown]);

  // Sem H2 no conteúdo: renderiza dentro de um único card premium.
  if (blocks.length === 0) {
    return (
      <article className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 backdrop-blur-sm">
        <div className="max-w-[68ch] text-[15px] sm:text-base">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {markdown.trim()}
          </ReactMarkdown>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {intro && (
        <div className="max-w-[68ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {intro}
          </ReactMarkdown>
        </div>
      )}
      {blocks.map((b, i) => (
        <BlockCard key={i} block={b} />
      ))}
    </div>
  );
}
