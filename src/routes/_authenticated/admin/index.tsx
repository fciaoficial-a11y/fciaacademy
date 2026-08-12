import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Award, BookOpen, CheckCircle2, Download, FileText, GraduationCap, Users } from "lucide-react";
import { adminMetricsQuery } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const m = useQuery(adminMetricsQuery);
  const d = m.data;
  const [reportContent, setReportContent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/migration-report")
      .then((res) => res.text())
      .then((text) => {
        if (!text.startsWith("Relatório não encontrado")) {
          setReportContent(text);
        }
      })
      .catch(() => {});
  }, []);

  const cards = [
    { icon: Users, label: "Total de alunos", value: d?.total_students ?? 0 },
    { icon: BookOpen, label: "Cursos ativos", value: d?.active_courses ?? 0 },
    { icon: Award, label: "Certificados emitidos", value: d?.certificates_issued ?? 0 },
    { icon: GraduationCap, label: "Cursos concluídos", value: d?.courses_completed ?? 0 },
    { icon: CheckCircle2, label: "Taxa de aprovação", value: `${d?.approval_rate ?? 0}%` },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Visão geral</h1>
      <p className="mt-1 text-sm text-muted-foreground">Métricas em tempo real da plataforma.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 font-display text-2xl font-semibold">
              {m.isLoading ? "—" : value}
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
        Dados consultados via função segura (RBAC admin).
      </div>

      {reportContent && (
        <div className="mt-10 rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Relatório de Migração (Etapa 1)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(reportContent);
                  import("sonner").then((m) => m.toast.success("Conteúdo copiado!"));
                }}
              >
                Copiar
              </Button>
              <Button
                asChild
                variant="default"
                size="sm"
                className="h-8 gap-2 text-xs"
              >
                <a
                  href="/api/public/download-migration-report"
                  download="MIGRACAO_ESTADO_ATUAL.md"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .md
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-4 max-h-[400px] overflow-y-auto rounded-lg bg-black/20 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            <pre className="whitespace-pre-wrap">{reportContent}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
