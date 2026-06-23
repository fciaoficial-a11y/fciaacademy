import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Award, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { myCertificatesQuery } from "@/lib/certificate-queries";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/certificados")({
  head: () => ({
    meta: [
      { title: "Meus Certificados — FCIA Academy" },
      { name: "description", content: "Certificados conquistados na FCIA Academy." },
    ],
  }),
  component: CertificatesPage,
});

function CertificatesPage() {
  const [userId, setUserId] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data, isLoading } = useQuery(myCertificatesQuery(userId));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Conquistas
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Meus <span className="text-gradient">Certificados</span>
      </h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Cada certificado é emitido após aprovação no quiz do curso (nota mínima 70%).
      </p>

      <div className="mt-10">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl border border-border/40 bg-card/40"
              />
            ))}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data!.map((c) => (
              <CertificateCard key={c.id} certificate={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Award className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">
        Nenhum certificado por aqui ainda
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Conclua um curso e seja aprovado no quiz com nota mínima de 70% para conquistar seu primeiro certificado.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/cursos">Explorar cursos</Link>
      </Button>
    </div>
  );
}
