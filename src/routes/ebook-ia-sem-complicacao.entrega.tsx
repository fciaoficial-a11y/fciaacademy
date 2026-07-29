import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download, ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { EBOOK_CONFIG } from "@/lib/ebook-ia-sem-complicacao/config";
import { Button } from "@/components/ui/button";
import guiaPdf from "@/assets/ebook-ia-sem-complicacao/ia-sem-complicacao-guia.pdf.asset.json";
import bonusPdf from "@/assets/ebook-ia-sem-complicacao/50-tarefas-bonus.pdf.asset.json";

const PAGE_TITLE = "Entrega — IA Sem Complicação | FCIA Academy";
const PAGE_DESCRIPTION =
  "Acesse o ebook IA Sem Complicação e o bônus 50 tarefas exclusivo para alunos que concluíram a compra.";

export const Route = createFileRoute("/ebook-ia-sem-complicacao/entrega")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EbookDeliveryPage,
});

function EbookDeliveryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const accessQuery = useQuery({
    queryKey: ["ebook-delivery-access", user?.id, EBOOK_CONFIG.courseSlug],
    enabled: !!user,
    queryFn: async () => {
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, title, delivery_url, product_type")
        .eq("slug", EBOOK_CONFIG.courseSlug)
        .maybeSingle();
      if (courseError) throw courseError;
      if (!course) return { authorized: false as const };

      const { data: hasAccess, error: rpcError } = await supabase.rpc("has_course_access", {
        _user: user!.id,
        _course: course.id,
      });
      if (rpcError) throw rpcError;

      return {
        authorized: hasAccess === true,
        course,
      } as const;
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { redirect: "/ebook-ia-sem-complicacao/entrega" } });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || accessQuery.isLoading || !user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (accessQuery.data && !accessQuery.data.authorized) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4">
        <div className="w-full rounded-2xl border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta página fica disponível após a confirmação do pagamento do ebook. Se você acabou de pagar,
            aguarde alguns instantes ou verifique novamente após a confirmação do PIX.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/ebook-ia-sem-complicacao">Voltar para a oferta</Link>
            </Button>
            <Button asChild variant="outline">
              <a
                href={`https://wa.me/${EBOOK_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  "Paguei o ebook e quero validar meu acesso",
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const course = accessQuery.data?.course;
  const driveUrl = course?.delivery_url ?? "";

  return (
    <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <h1 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
          Compra confirmada — acesso liberado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Obrigado! Baixe abaixo o guia principal e o bônus. O material fica sempre disponível nesta página,
          basta entrar com sua conta FCIA.
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        <DeliveryItem
          title="IA Sem Complicação — Guia oficial (PDF)"
          description="O guia completo, com linguagem simples e aplicação imediata."
          href={guiaPdf.url}
          filename="ia-sem-complicacao-guia.pdf"
        />
        <DeliveryItem
          title="Bônus: 50 tarefas simples que você pode vender usando IA (PDF)"
          description="Ideias práticas de serviços e produtos para começar a monetizar."
          href={bonusPdf.url}
          filename="50-tarefas-bonus.pdf"
        />

        {driveUrl && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Acesso alternativo
            </p>
            <p className="mt-2 text-sm text-foreground/80">
              Se preferir, também disponibilizamos o material via Google Drive.
            </p>
            <Button asChild variant="outline" className="mt-3">
              <a href={driveUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir no Google Drive
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card/50 p-5 text-sm text-muted-foreground">
        <p>
          Precisa de suporte?{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4"
            href={`https://wa.me/${EBOOK_CONFIG.whatsappNumber}?text=${encodeURIComponent(
              "Preciso de ajuda com o acesso ao ebook",
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Fale conosco no WhatsApp
          </a>
          .
        </p>
      </div>
    </main>
  );
}

function DeliveryItem({
  title,
  description,
  href,
  filename,
}: {
  title: string;
  description: string;
  href: string;
  filename: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="font-display text-base font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild className="sm:shrink-0">
        <a href={href} download={filename} target="_blank" rel="noreferrer">
          <Download className="mr-2 h-4 w-4" />
          Baixar
        </a>
      </Button>
    </div>
  );
}
