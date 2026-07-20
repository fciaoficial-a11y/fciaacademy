import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Award,
  Download,
  Linkedin,
  Loader2,
  Printer,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { generateCertificate } from "@/lib/certificate.functions";

export const Route = createFileRoute("/_authenticated/certificados/$id")({
  component: CertificateDetailPage,
  notFoundComponent: CertificateNotFoundPage,
});

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

type CertRow = {
  id: string;
  user_id: string;
  course_id: string;
  validation_code: string;
  pdf_url: string | null;
  issued_at: string;
  completion_date: string | null;
  student_name_snapshot: string | null;
  course_title_snapshot: string | null;
  workload_hours_snapshot: number | null;
  courses: { title: string; slug: string } | null;
};

function CertificateDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | undefined>();
  const [studentName, setStudentName] = useState<string>("Aluno FCIA");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const generateFn = useServerFn(generateCertificate);

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
      setStudentName(
        p?.full_name || data.user.email?.split("@")[0] || "Aluno FCIA"
      );
    })();
  }, []);

  const { data: cert, isLoading, isError, error } = useQuery({
    queryKey: ["certificate", id, userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<CertRow | null> => {
      const { data, error } = await supabase
        .from("certificates")
        .select(
          "id, user_id, course_id, validation_code, pdf_url, issued_at, completion_date, student_name_snapshot, course_title_snapshot, workload_hours_snapshot, courses(title, slug)"
        )
        .eq("id", id)
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...(data as any),
        courses: Array.isArray((data as any).courses)
          ? (data as any).courses[0]
          : (data as any).courses,
      } as CertRow;
    },
  });

  useEffect(() => {
    if (!cert?.pdf_url) {
      setSignedUrl(null);
      return;
    }
    let alive = true;
    supabase.storage
      .from("certificates")
      .createSignedUrl(cert.pdf_url, YEAR_IN_SECONDS)
      .then(({ data }) => {
        if (alive) setSignedUrl(data?.signedUrl ?? null);
      });
    return () => {
      alive = false;
    };
  }, [cert?.pdf_url]);

  const generate = useMutation({
    mutationFn: async () => generateFn({ data: { certificateId: id } }),
    onSuccess: async () => {
      toast.success("Certificado gerado!", {
        description: "Seu PDF já está disponível para download.",
      });
      await queryClient.invalidateQueries({ queryKey: ["certificate", id] });
      await queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: (err: Error) =>
      toast.error("Não foi possível gerar o PDF", { description: err.message }),
  });

  if (!userId || isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl">Erro ao carregar certificado.</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error?.message}</p>
      </div>
    );
  }

  if (!cert) {
    throw notFound();
  }

  const issued = new Date(cert.issued_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const validateUrl = `${window.location.origin}/validar-certificado/${cert.validation_code}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    validateUrl
  )}`;
  const displayName = cert.student_name_snapshot || studentName;
  const courseTitle =
    cert.course_title_snapshot || cert.courses?.title || "Curso FCIA";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to="/certificados">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Link
              to="/validar-certificado/$codigo"
              params={{ codigo: cert.validation_code }}
              target="_blank"
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> Validar autenticidade
            </Link>
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href={linkedinUrl} target="_blank" rel="noreferrer">
              <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
            </a>
          </Button>
          {signedUrl ? (
            <Button asChild size="sm" className="rounded-full">
              <a href={signedUrl} target="_blank" rel="noreferrer" download>
                <Download className="mr-2 h-4 w-4" /> Baixar PDF
              </a>
            </Button>
          ) : (
            <Button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              size="sm"
              className="rounded-full"
            >
              {generate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Gerar certificado
            </Button>
          )}
        </div>
      </div>

      {signedUrl ? (
        <div className="overflow-hidden rounded-3xl border-2 border-primary/30 bg-card shadow-2xl">
          <iframe
            title={`Certificado ${cert.validation_code}`}
            src={signedUrl}
            className="h-[70vh] w-full bg-white"
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl sm:p-14">
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
              {displayName}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              concluiu com aproveitamento o curso
            </p>
            <p className="mt-2 font-display text-xl font-medium sm:text-2xl">
              {courseTitle}
            </p>
            <div className="mx-auto mt-10 grid max-w-md gap-4 sm:grid-cols-2">
              <Field label="Data" value={issued} />
              <Field label="Código" value={cert.validation_code} mono />
              {cert.workload_hours_snapshot != null &&
                cert.workload_hours_snapshot > 0 && (
                  <Field
                    label="Carga horária"
                    value={`${cert.workload_hours_snapshot}h`}
                  />
                )}
            </div>
            <p className="mt-8 text-xs text-muted-foreground">
              Clique em <strong>Gerar certificado</strong> para produzir o PDF assinado.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Código de validação
          </p>
          <p className="mt-1 font-mono text-sm">{cert.validation_code}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {validateUrl}
          </p>
        </div>
        <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-white p-4">
          <QRCodeSVG value={validateUrl} size={128} level="M" />
        </div>
      </div>
    </div>
  );
}

function CertificateNotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <XCircle className="h-7 w-7" />
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold">
        Certificado não encontrado
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Este certificado não existe ou não pertence à sua conta.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/certificados">
          <ArrowLeft className="mr-2 h-4 w-4" /> Meus Certificados
        </Link>
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-sm ${mono ? "font-mono" : "font-medium"}`}>
        {value}
      </p>
    </div>
  );
}
