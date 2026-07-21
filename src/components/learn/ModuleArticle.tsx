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

type LevelStyle = {
  level: "hero" | "callout" | "alert" | "summary" | "section";
  wrapper: string;
  labelClass: string;
  icon: ReactNode;
  label: string;
  titleClass: string;
};

const kindStyles: Record<BlockKind, LevelStyle> = {
  objetivo: {
    level: "hero",
    wrapper:
      "relative rounded-xl border-l-2 border-primary bg-primary/[0.04] px-6 py-6 sm:px-8 sm:py-7 dark:bg-primary/[0.06]",
    labelClass: "text-primary",
    icon: <Target className="h-3.5 w-3.5" />,
    label: "Objetivo do módulo",
    titleClass: "font-display text-[1.6rem] font-semibold tracking-tight text-foreground sm:text-[1.9rem]",
  },
  exemplo: {
    level: "callout",
    wrapper:
      "rounded-lg border border-border/70 bg-surface-muted/50 px-5 py-5 sm:px-6 sm:py-6 dark:bg-surface/40",
    labelClass: "text-sky-700 dark:text-sky-300",
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    label: "Exemplo prático",
    titleClass: "font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
  },
  erros: {
    level: "alert",
    wrapper:
      "rounded-lg border border-amber-500/25 border-l-2 border-l-amber-500 bg-amber-500/[0.05] px-5 py-5 sm:px-6 sm:py-6",
    labelClass: "text-amber-700 dark:text-amber-300",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Erros comuns",
    titleClass: "font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
  },
  fechamento: {
    level: "summary",
    wrapper:
      "rounded-xl border-t-2 border-emerald-500/60 bg-emerald-500/[0.04] px-6 py-6 sm:px-8 sm:py-7",
    labelClass: "text-emerald-700 dark:text-emerald-300",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "Fechamento",
    titleClass: "font-display text-[1.55rem] font-semibold tracking-tight text-foreground sm:text-[1.8rem]",
  },
  transicao: {
    level: "section",
    wrapper: "",
    labelClass: "text-violet-700 dark:text-violet-300",
    icon: <ArrowRight className="h-3.5 w-3.5" />,
    label: "Próximo passo",
    titleClass: "font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl",
  },
  default: {
    level: "section",
    wrapper: "",
    labelClass: "text-muted-foreground",
    icon: <BookOpen className="h-3.5 w-3.5" />,
    label: "",
    titleClass: "font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]",
  },
};

const mdComponents: Components = {
  h1: ({ children }) => (
    <h3 className="mt-8 mb-3 font-display text-xl font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-6 mb-2 font-display text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h4>
  ),
  h4: ({ children }) => (
    <h5 className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h5>
  ),
  p: ({ children }) => (
    <p className="my-4 leading-[1.75] text-foreground/90">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-4 space-y-2 pl-5 list-disc marker:text-primary/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 space-y-2 pl-5 list-decimal marker:text-primary/60">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-[1.75]">{children}</li>,
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
    <blockquote className="my-5 border-l-2 border-primary/50 pl-4 italic text-foreground/80">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border/60" />,
  img: ({ src, alt }) => (
    <img
      src={src as string}
      alt={alt ?? ""}
      loading="lazy"
      className="my-6 w-full rounded-lg border border-border/60"
    />
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono text-primary">
      {children}
    </code>
  ),
};

function BlockSection({ block }: { block: Block }) {
  const s = kindStyles[block.kind];
  const isPlain = s.level === "section";

  return (
    <section className={cn("scroll-mt-24", s.wrapper)}>
      {s.label && (
        <div
          className={cn(
            "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
            s.labelClass,
          )}
        >
          {s.icon}
          <span>{s.label}</span>
        </div>
      )}
      <h2 className={cn(s.label ? "mt-2.5" : "", s.titleClass)}>
        {block.title}
      </h2>
      <div
        className={cn(
          "mt-3 max-w-[66ch] text-[15px] sm:text-base",
          isPlain && "prose-reading",
        )}
      >
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
