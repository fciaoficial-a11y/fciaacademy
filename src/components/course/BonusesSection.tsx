import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, Download, Lock, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courseBonusesQuery, type CourseBonusPublic } from "@/lib/bonuses-queries";
import { getBonusDownloadUrl } from "@/lib/bonuses.functions";

interface BonusesSectionProps {
  courseId: string;
  hasAccess: boolean;
  className?: string;
}

export function BonusesSection({ courseId, hasAccess, className }: BonusesSectionProps) {
  const bonuses = useQuery(courseBonusesQuery(courseId, hasAccess));

  if (!hasAccess) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center",
          className,
        )}
        aria-label="Bônus exclusivos"
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Bônus exclusivos da Masterclass
          </h3>
          <p className="text-sm text-muted-foreground">
            4 materiais complementares liberados após a matrícula: Biblioteca de Prompts,
            Painel de Referências, Guia de Integração e Kit de Monetização.
          </p>
        </div>
      </section>
    );
  }

  if (bonuses.isLoading) {
    return (
      <section className={cn("rounded-2xl border border-border/60 bg-card/50 p-6", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando bônus…
        </div>
      </section>
    );
  }

  if (bonuses.isError || !bonuses.data || bonuses.data.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-5", className)} aria-label="Bônus exclusivos">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Gift className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">
            Bônus exclusivos
          </h3>
          <p className="text-sm text-muted-foreground">
            Materiais complementares oficiais da Masterclass. Baixe em PDF quando quiser.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {bonuses.data.map((b) => (
          <BonusCard key={b.id} bonus={b} />
        ))}
      </div>
    </section>
  );
}

function BonusCard({ bonus }: { bonus: CourseBonusPublic }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!bonus.has_pdf) {
      toast.error("Este bônus ainda não tem PDF disponível.");
      return;
    }
    setLoading(true);
    try {
      const { url } = await getBonusDownloadUrl({ data: { bonusId: bonus.id } });
      // Open in a new tab; the browser will download or preview the PDF.
      if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      toast.success("Download liberado.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao liberar o bônus.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        {bonus.value_label && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            {bonus.value_label}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <h4 className="font-display text-base font-semibold leading-tight text-foreground">
          {bonus.title}
        </h4>
        {bonus.subtitle && (
          <p className="text-sm text-muted-foreground">{bonus.subtitle}</p>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground/90">
        {bonus.description}
      </p>

      <div className="mt-auto pt-2">
        <Button
          onClick={handleDownload}
          disabled={loading || !bonus.has_pdf}
          size="sm"
          className="w-full rounded-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando…
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> Baixar PDF
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
