import { Link } from "@tanstack/react-router";
import { Award, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CertificateRow } from "@/lib/certificate-queries";

interface CertificateCardProps {
  certificate: CertificateRow;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const issued = new Date(certificate.issued_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const courseTitle = certificate.courses?.title ?? "Curso FCIA";
  const validateUrl = `/validar-certificado/${certificate.validation_code}`;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl transition-all group-hover:bg-primary/30"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Award className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary">
          <ShieldCheck className="h-3 w-3" /> Emitido
        </span>
      </div>

      <h3 className="relative mt-4 font-display text-lg font-semibold leading-snug">
        {courseTitle}
      </h3>
      <p className="relative mt-1 text-xs text-muted-foreground">Concluído em {issued}</p>

      <div className="relative mt-4 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        {certificate.validation_code}
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link to="/certificados/$id" params={{ id: certificate.id }}>
            Ver certificado
          </Link>
        </Button>
        {certificate.pdf_url ? (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <a href={certificate.pdf_url} target="_blank" rel="noreferrer">
              <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
            </a>
          </Button>
        ) : null}
        <Button asChild size="sm" variant="ghost" className="rounded-full">
          <a href={validateUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Validar
          </a>
        </Button>
      </div>
    </article>
  );
}
