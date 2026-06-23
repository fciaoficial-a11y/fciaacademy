import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  Download,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { myCertificatesQuery } from "@/lib/certificate-queries";

export const Route = createFileRoute("/_authenticated/certificados/$id")({
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold">Certificado não encontrado</h1>
      <Link
        to="/certificados"
        className="mt-6 inline-block text-sm text-primary hover:underline"
      >
        Voltar aos certificados
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="font-display text-2xl">Erro ao carregar certificado.</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: CertificateDetailPage,
});

function CertificateDetailPage() {
  const { id } = Route.useParams();
  const [userId, setUserId] = useState<string | undefined>();
  const [studentName, setStudentName] = useState<string>("Aluno FCIA");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .maybeSingle();
      setStudentName(p?.full_name || data.user.email?.split("@")[0] || "Aluno FCIA");
    })();
  }, []);

  const { data } = useSuspenseQuery(myCertificatesQuery(userId));
  const cert = data?.find((c) => c.id === id);
  if (userId && !cert) throw notFound();
  if (!cert) return null;

  const issued = new Date(cert.issued_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const validateUrl = `${window.location.origin}/validar-certificado/${cert.validation_code}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to="/certificados">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          {cert.pdf_url && (
            <Button asChild size="sm" className="rounded-full">
              <a href={cert.pdf_url} target="_blank" rel="noreferrer">
                <Download className="mr-2 h-4 w-4" /> Baixar PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl sm:p-14">
        <div
          className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />

        <div className="relative text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Award className="h-8 w-8" />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-primary">
            FCIA Academy
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Certificado de Conclusão
          </h1>
          <p className="mt-6 text-sm text-muted-foreground">Certificamos que</p>
          <p className="mt-2 font-display text-2xl font-semibold text-gradient sm:text-3xl">
            {studentName}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            concluiu com aproveitamento o curso
          </p>
          <p className="mt-2 font-display text-xl font-medium sm:text-2xl">
            {cert.courses?.title ?? "Curso FCIA"}
          </p>

          <div className="mx-auto mt-10 grid max-w-md gap-4 sm:grid-cols-2">
            <Field label="Data" value={issued} />
            <Field label="Código" value={cert.validation_code} mono />
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs text-primary">
            <ShieldCheck className="h-4 w-4" />
            Validar em {validateUrl}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
    </div>
  );
}
