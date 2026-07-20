import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Award, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateCertificateQuery } from "@/lib/certificate-queries";

export const Route = createFileRoute("/validar-certificado/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `Validar certificado ${params.codigo} — FCIA Academy` },
      {
        name: "description",
        content: "Validação pública de certificados emitidos pela FCIA Academy.",
      },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(validateCertificateQuery(params.codigo)),
  notFoundComponent: () => <NotFoundState />,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="font-display text-2xl">Erro ao validar certificado.</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ValidatePage,
});

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ValidatePage() {
  const { codigo } = Route.useParams();
  const { data } = useSuspenseQuery(validateCertificateQuery(codigo));

  if (!data) return <NotFoundState code={codigo} />;

  const revoked = data.status === "revoked";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
      <div
        className={`rounded-3xl border-2 p-8 shadow-2xl sm:p-12 ${
          revoked
            ? "border-destructive/30 bg-destructive/5"
            : "border-primary/30 bg-gradient-to-br from-card via-card to-primary/5"
        }`}
      >
        <div className="text-center">
          <div
            className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${
              revoked
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary"
            }`}
          >
            {revoked ? <XCircle className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
          </div>
          <p
            className={`mt-4 text-xs uppercase tracking-[0.3em] ${
              revoked ? "text-destructive" : "text-primary"
            }`}
          >
            {revoked ? "Certificado revogado" : "Certificado válido"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Autenticado pela {data.institution_name}
          </h1>
        </div>

        <div className="mt-8 space-y-3">
          <Row label="Aluno" value={data.student_name} />
          <Row label="Curso" value={data.course_title} />
          {data.track_title && <Row label="Trilha" value={data.track_title} />}
          {data.workload_hours != null && data.workload_hours > 0 && (
            <Row label="Carga horária" value={`${data.workload_hours}h`} />
          )}
          <Row label="Data de conclusão" value={fmt(data.completion_date ?? data.issued_at)} />
          <Row label="Emitido em" value={fmt(data.issued_at)} />
          <Row label="Código de validação" value={data.validation_code} mono />
        </div>

        <p className="mt-8 rounded-xl border border-border/60 bg-background p-4 text-sm leading-relaxed text-foreground/90">
          Este certificado comprova a conclusão de curso livre de capacitação e
          atualização profissional, emitido pela FCIA Academy, com a carga horária
          indicada nesta página. Cursos livres não dependem de autorização ou
          reconhecimento prévio dos sistemas de ensino. Este certificado não
          equivale a diploma de curso técnico, graduação ou pós-graduação e não
          habilita, por si só, para o exercício de profissões regulamentadas.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Este certificado foi conferido em nossa base de dados oficial.
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/">Voltar para a FCIA Academy</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className={`text-sm ${mono ? "font-mono uppercase" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

function NotFoundState({ code }: { code?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <XCircle className="h-7 w-7" />
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold">Certificado não encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Não localizamos nenhum certificado{code ? ` com o código ${code}` : ""}. Verifique o código
        informado.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/">
          <Award className="mr-2 h-4 w-4" /> Ir para a FCIA Academy
        </Link>
      </Button>
    </div>
  );
}
