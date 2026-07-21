import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  ExternalLink,
  Eye,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  adminCertificatesQuery,
  adminCoursesQuery,
  adminUsersQuery,
  updateRow,
} from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/certificados")({
  component: AdminCertificatesPage,
});

import {
  TEMPLATE_OPTIONS,
  type TemplateKey,
} from "@/lib/certificate-templates";

type Settings = {
  id: number;
  institution_name: string;
  legal_name: string | null;
  cnpj: string | null;
  issuer_name: string;
  issuer_role: string;
  validation_base_url: string;
  logo_url: string | null;
  signature_image_url: string | null;
  certificate_title: string;
  body_template: string;
  legal_footer: string;
  min_score: number;
  auto_issue: boolean;
  template_key: TemplateKey;
};

const DEFAULT_TEMPLATE =
  "A FCIA Academy certifica que {{student_name}} concluiu com aproveitamento o curso livre de capacitação e atualização profissional {{course_title}}, com carga horária total de {{workload_hours}} horas, concluído em {{completion_date}}.";
const DEFAULT_FOOTER =
  "Curso livre de capacitação e atualização profissional, sem equivalência a diploma de curso técnico, graduação ou pós-graduação, e sem declaração de reconhecimento pelo MEC.";

function applyTemplate(tpl: string, vars: Record<string, string | number>) {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) =>
    vars[k] == null ? "" : String(vars[k])
  );
}

function useSettings() {
  return useQuery({
    queryKey: ["admin", "certificate_settings"],
    queryFn: async (): Promise<Settings> => {
      const { data, error } = await supabase
        .from("certificate_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data as Settings;
    },
  });
}

function AdminCertificatesPage() {
  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold">Certificados</h1>
        <p className="text-sm text-muted-foreground">
          Configure identidade institucional, template, regras e gerencie certificados emitidos.
        </p>
      </header>

      <Tabs defaultValue="institucional" className="mt-6">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="institucional">
            <Settings className="mr-2 h-4 w-4" /> Institucional
          </TabsTrigger>
          <TabsTrigger value="template">
            <Sparkles className="mr-2 h-4 w-4" /> Template
          </TabsTrigger>
          <TabsTrigger value="regras">
            <Sliders className="mr-2 h-4 w-4" /> Regras
          </TabsTrigger>
          <TabsTrigger value="gestao">
            <ShieldCheck className="mr-2 h-4 w-4" /> Emitidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="institucional" className="mt-6">
          <InstitutionalTab />
        </TabsContent>
        <TabsContent value="template" className="mt-6">
          <TemplateTab />
        </TabsContent>
        <TabsContent value="regras" className="mt-6">
          <RulesTab />
        </TabsContent>
        <TabsContent value="gestao" className="mt-6">
          <ManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ------------------- Institucional -------------------

function InstitutionalTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useSettings();
  const [form, setForm] = useState<Partial<Settings>>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        institution_name: form.institution_name ?? "FCIA Academy",
        legal_name: form.legal_name ?? "",
        cnpj: form.cnpj ?? "",
        issuer_name: form.issuer_name ?? "",
        issuer_role: form.issuer_role ?? "",
        validation_base_url: form.validation_base_url ?? "",
        logo_url: form.logo_url ?? "",
        signature_image_url: form.signature_image_url ?? "",
      };
      const { error } = await supabase
        .from("certificate_settings")
        .update(payload)
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dados institucionais salvos.");
      qc.invalidateQueries({ queryKey: ["admin", "certificate_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <SkeletonBox />;

  const bind = (k: keyof Settings) => ({
    value: (form[k] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome institucional">
          <Input {...bind("institution_name")} placeholder="FCIA Academy" />
        </Field>
        <Field label="Razão social">
          <Input {...bind("legal_name")} placeholder="Fernando Cabral IA LTDA" />
        </Field>
        <Field label="CNPJ">
          <Input {...bind("cnpj")} placeholder="00.000.000/0001-00" />
        </Field>
        <Field label="Nome do responsável (assinatura)">
          <Input {...bind("issuer_name")} placeholder="Prof. Fernando Cabral" />
        </Field>
        <Field label="Cargo do responsável">
          <Input {...bind("issuer_role")} placeholder="CEO & Founder — FCIA" />
        </Field>
        <Field label="Base URL de validação">
          <Input
            {...bind("validation_base_url")}
            placeholder="https://fciaacademy.lovable.app/validar-certificado"
          />
        </Field>
        <Field label="URL do logo">
          <Input {...bind("logo_url")} placeholder="https://..." />
        </Field>
        <Field label="URL da imagem da assinatura">
          <Input {...bind("signature_image_url")} placeholder="https://..." />
        </Field>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
    </Card>
  );
}

// ------------------- Template -------------------

const SAMPLE_STUDENT = "Fernando Aluno da Silva";
const SAMPLE_COURSE = "Introdução à IA Generativa";
const SAMPLE_WORKLOAD = 20;
const SAMPLE_CODE = "FCIA-2K26-A9X4";

function TemplateTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useSettings();
  const [form, setForm] = useState<Partial<Settings>>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("certificate_settings")
        .update({
          certificate_title: form.certificate_title || "Certificado de Conclusão",
          body_template: form.body_template || DEFAULT_TEMPLATE,
          legal_footer: form.legal_footer || DEFAULT_FOOTER,
          template_key: form.template_key ?? "dark_premium_tech",
        })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template atualizado.");
      qc.invalidateQueries({ queryKey: ["admin", "certificate_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sampleDate = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const previewBody = useMemo(
    () =>
      applyTemplate(form.body_template || DEFAULT_TEMPLATE, {
        student_name: SAMPLE_STUDENT,
        course_title: SAMPLE_COURSE,
        workload_hours: SAMPLE_WORKLOAD,
        completion_date: sampleDate,
        institution_name: form.institution_name || "FCIA Academy",
      }),
    [form.body_template, form.institution_name, sampleDate]
  );

  if (isLoading) return <SkeletonBox />;

  const selected: TemplateKey = form.template_key ?? "dark_premium_tech";

  return (
    <div className="space-y-6">
      {/* --- Model picker --- */}
      <Card>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Modelo visual</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Escolha o layout que será aplicado a todos os certificados emitidos.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {TEMPLATE_OPTIONS.map((opt) => {
            const active = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, template_key: opt.key }))
                }
                className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
                  active
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border/60 hover:border-primary/50"
                }`}
              >
                <TemplateThumb
                  templateKey={opt.key}
                  institution={form.institution_name || "FCIA Academy"}
                  title={form.certificate_title || "Certificado de Conclusão"}
                />
                <div className="flex flex-1 flex-col gap-1 border-t border-border/60 bg-card/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-semibold">
                      {opt.name}
                    </p>
                    {active && (
                      <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Selecionado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] uppercase tracking-widest text-primary/80">
                    {opt.tagline}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* --- Editor + Live preview --- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-semibold">Conteúdo do certificado</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Campos dinâmicos disponíveis: <code>{"{{student_name}}"}</code>,{" "}
            <code>{"{{course_title}}"}</code>, <code>{"{{workload_hours}}"}</code>,{" "}
            <code>{"{{completion_date}}"}</code>, <code>{"{{institution_name}}"}</code>.
          </p>

          <div className="mt-4 space-y-4">
            <Field label="Título do certificado">
              <Input
                value={form.certificate_title ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, certificate_title: e.target.value }))
                }
                placeholder="Certificado de Conclusão"
              />
            </Field>
            <Field label="Corpo do certificado">
              <Textarea
                rows={6}
                value={form.body_template ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body_template: e.target.value }))
                }
                placeholder={DEFAULT_TEMPLATE}
              />
            </Field>
            <Field label="Rodapé legal">
              <Textarea
                rows={4}
                value={form.legal_footer ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, legal_footer: e.target.value }))
                }
                placeholder={DEFAULT_FOOTER}
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar template
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">
              Prévia — {TEMPLATE_OPTIONS.find((t) => t.key === selected)?.name}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Preview visual do modelo com dados de exemplo. O PDF final é gerado no
            momento da emissão.
          </p>
          <div className="mt-4">
            <TemplatePreviewLarge
              templateKey={selected}
              institution={form.institution_name || "FCIA Academy"}
              title={form.certificate_title || "Certificado de Conclusão"}
              body={previewBody}
              legalFooter={form.legal_footer || DEFAULT_FOOTER}
              issuerName={form.issuer_name || "Prof. Fernando Cabral"}
              issuerRole={form.issuer_role || "CEO & Founder — FCIA"}
              completionDate={sampleDate}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---- Preview components (HTML approximations of each PDF template) ----

interface PreviewProps {
  templateKey: TemplateKey;
  institution: string;
  title: string;
}

function TemplateThumb({ templateKey, institution, title }: PreviewProps) {
  // Small thumbnail preview shown inside the picker card.
  return (
    <div className="aspect-[297/210] w-full">
      <div className="h-full w-full">
        <PreviewCanvas
          templateKey={templateKey}
          institution={institution}
          title={title}
          body="Concluiu com aproveitamento o curso livre de capacitação e atualização profissional em Introdução à IA Generativa, carga horária total de 20 horas."
          legalFooter="Curso livre de capacitação."
          issuerName="Prof. Fernando Cabral"
          issuerRole="CEO & Founder — FCIA"
          completionDate="21 de julho de 2026"
          compact
        />
      </div>
    </div>
  );
}

function TemplatePreviewLarge(props: {
  templateKey: TemplateKey;
  institution: string;
  title: string;
  body: string;
  legalFooter: string;
  issuerName: string;
  issuerRole: string;
  completionDate: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 shadow-lg">
      <div className="aspect-[297/210] w-full">
        <PreviewCanvas {...props} />
      </div>
    </div>
  );
}

interface CanvasProps {
  templateKey: TemplateKey;
  institution: string;
  title: string;
  body: string;
  legalFooter: string;
  issuerName: string;
  issuerRole: string;
  completionDate: string;
  compact?: boolean;
}

function PreviewCanvas({
  templateKey,
  institution,
  title,
  body,
  legalFooter,
  issuerName,
  issuerRole,
  completionDate,
  compact,
}: CanvasProps) {
  if (templateKey === "executive_tech") {
    return (
      <div className="relative flex h-full w-full flex-col bg-[#f8f9fb] font-sans text-[#0a1a3a]">
        <div className="flex items-center justify-between bg-[#0a1a3a] px-4 py-1.5 text-[8px] uppercase tracking-[0.25em] text-white sm:text-[10px]">
          <span className="font-bold">{institution}</span>
          <span className="text-[#c1d0f5]">Educação Executiva</span>
        </div>
        <div className="h-[3px] bg-[#3b6ff5]" />
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-[#3b6ff5] sm:text-[10px]">
              Certificado
            </p>
            <p className="mt-0.5 text-[8px] uppercase tracking-widest text-[#6b7590] sm:text-[10px]">
              {title}
            </p>
            <p className="mt-3 font-serif text-lg font-bold leading-tight text-[#0a1a3a] sm:mt-4 sm:text-2xl">
              {SAMPLE_STUDENT}
            </p>
            <div className="mt-1 h-[2px] w-10 bg-[#3b6ff5]" />
            {!compact && (
              <p className="mt-3 line-clamp-3 text-[10px] leading-relaxed text-[#2a324a] sm:text-xs">
                {body}
              </p>
            )}
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="border-t border-[#0a1a3a] pt-1">
                <p className="truncate text-[8px] font-bold sm:text-[10px]">
                  {issuerName}
                </p>
                <p className="truncate text-[7px] italic text-[#6b7590] sm:text-[9px]">
                  {issuerRole}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="grid h-8 w-8 grid-cols-4 grid-rows-4 gap-[1px] rounded-sm border border-[#0a1a3a] bg-white p-[2px] sm:h-10 sm:w-10">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={i % 3 === 0 ? "bg-[#0a1a3a]" : "bg-white"}
                  />
                ))}
              </div>
              <p className="mt-1 text-[6px] font-bold uppercase tracking-wider text-[#6b7590] sm:text-[7px]">
                {SAMPLE_CODE}
              </p>
            </div>
          </div>
          {!compact && (
            <p className="mt-2 text-center text-[6px] italic text-[#6b7590] sm:text-[7px]">
              {legalFooter}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (templateKey === "editorial_prestige") {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-between bg-[#faf7f1] p-4 font-serif text-[#1c1d24] sm:p-6">
        <div className="absolute inset-2 border border-[#1c1d24]/80 sm:inset-3" />
        <div className="relative flex flex-col items-center pt-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] sm:text-[10px]">
            {institution}
          </p>
          <div className="mt-1 h-[2px] w-10 bg-[#b8951f]" />
        </div>
        <div className="relative flex flex-col items-center text-center">
          <p className="font-serif text-base leading-tight sm:text-2xl">{title}</p>
          <p className="mt-1 text-[8px] italic text-[#6a5f4d] sm:text-[10px]">
            Concedido a
          </p>
          <p className="mt-1 font-serif text-lg font-bold leading-tight sm:mt-2 sm:text-2xl">
            {SAMPLE_STUDENT}
          </p>
          <div className="mt-1 h-[1px] w-16 bg-[#b8951f]" />
          {!compact && (
            <p className="mt-2 line-clamp-2 max-w-[85%] text-[9px] leading-relaxed text-[#3a3a44] sm:text-[11px]">
              {body}
            </p>
          )}
          <p className="mt-1 text-[8px] italic text-[#6a5f4d] sm:text-[10px]">
            Carga de {SAMPLE_WORKLOAD}h · Concluído em {completionDate}
          </p>
        </div>
        <div className="relative flex w-full items-end justify-between gap-3">
          <div className="text-left text-[7px] text-[#6a5f4d] sm:text-[8px]">
            <p>Código: {SAMPLE_CODE}</p>
            <p>Emitido em {completionDate}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-[2px] w-24 bg-[#1c1d24]" />
            <p className="mt-0.5 text-[8px] font-bold sm:text-[10px]">{issuerName}</p>
            <p className="text-[7px] italic text-[#6a5f4d] sm:text-[9px]">
              {issuerRole}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="grid h-7 w-7 grid-cols-4 grid-rows-4 gap-[1px] bg-white p-[1px] sm:h-8 sm:w-8">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={i % 2 === 0 ? "bg-[#1c1d24]" : "bg-white"}
                />
              ))}
            </div>
            <p className="mt-0.5 text-[6px] font-bold uppercase tracking-wider text-[#6a5f4d]">
              Validar
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dark Premium Tech
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0b0f1e] font-sans text-white">
      <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[#3c5cff]/25 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-[#a78bfa]/25 blur-2xl" />
      <div
        className="pointer-events-none absolute inset-4 opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(#6b60ff 1px, transparent 1px), linear-gradient(90deg, #6b60ff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative m-2 flex flex-1 flex-col border border-[#6b60ff]/50 p-3 sm:m-3 sm:p-5">
        <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.25em] sm:text-[10px]">
          <span className="font-bold text-[#98adff]">{institution}</span>
          <span className="text-[#b5bcd9]">Trilha IA</span>
        </div>
        <div className="mt-auto flex flex-col items-center text-center">
          <p className="font-display text-base font-bold sm:text-2xl">{title}</p>
          <p className="mt-2 font-display text-lg font-bold text-[#a1c4ff] sm:mt-3 sm:text-2xl">
            {SAMPLE_STUDENT}
          </p>
          {!compact && (
            <p className="mt-2 line-clamp-2 max-w-[92%] text-[9px] leading-relaxed text-[#dfe3fa] sm:text-[11px]">
              {body}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0 flex-1">
            <div className="border-t border-[#7d84c6]/60 pt-1">
              <p className="truncate text-[8px] font-bold sm:text-[10px]">
                {issuerName}
              </p>
              <p className="truncate text-[7px] italic text-[#b5bcd9] sm:text-[9px]">
                {issuerRole}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="grid h-9 w-9 grid-cols-4 grid-rows-4 gap-[1px] bg-white p-[2px] sm:h-11 sm:w-11">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={i * 7 % 3 === 0 ? "bg-[#0b0f1e]" : "bg-white"}
                />
              ))}
            </div>
            <p className="mt-1 text-[7px] font-bold uppercase tracking-wider sm:text-[8px]">
              {SAMPLE_CODE}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


// ------------------- Regras -------------------

function RulesTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useSettings();
  const courses = useQuery(adminCoursesQuery);
  const [minScore, setMinScore] = useState<number>(70);
  const [autoIssue, setAutoIssue] = useState<boolean>(true);

  useEffect(() => {
    if (data) {
      setMinScore(data.min_score ?? 70);
      setAutoIssue(data.auto_issue ?? true);
    }
  }, [data]);

  const saveRules = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("certificate_settings")
        .update({ min_score: minScore, auto_issue: autoIssue })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Regras atualizadas.");
      qc.invalidateQueries({ queryKey: ["admin", "certificate_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleCourse = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateRow("courses", id, { certificate_enabled: enabled }),
    onSuccess: () => {
      toast.success("Curso atualizado.");
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <SkeletonBox />;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold">Regras globais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nota mínima de aprovação (%)">
            <Input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            />
          </Field>
          <div className="flex items-end justify-between rounded-xl border border-white/10 bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium">Emissão automática</p>
              <p className="text-xs text-muted-foreground">
                Emitir certificado ao aprovar no quiz.
              </p>
            </div>
            <Switch checked={autoIssue} onCheckedChange={setAutoIssue} />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => saveRules.mutate()} disabled={saveRules.isPending}>
            {saveRules.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar regras
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">
          Certificado por curso
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Habilite quais cursos podem emitir certificado.
        </p>
        <div className="mt-4 divide-y divide-white/5 rounded-xl border border-white/10">
          {(courses.data ?? []).map((c: any) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  Carga horária: {c.workload_hours ?? 0}h
                </p>
              </div>
              <Switch
                checked={c.certificate_enabled ?? true}
                onCheckedChange={(v) =>
                  toggleCourse.mutate({ id: c.id, enabled: v })
                }
              />
            </div>
          ))}
          {!courses.data?.length && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhum curso cadastrado.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ------------------- Gestão / Emitidos -------------------

function ManagementTab() {
  const qc = useQueryClient();
  const certs = useQuery(adminCertificatesQuery);
  const courses = useQuery(adminCoursesQuery);
  const users = useQuery(adminUsersQuery);
  const [search, setSearch] = useState("");

  const toggleRevoke = useMutation({
    mutationFn: ({ id, revoked }: { id: string; revoked: boolean }) =>
      updateRow("certificates", id, {
        revoked_at: revoked ? null : new Date().toISOString(),
        status: revoked ? "issued" : "revoked",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "certificates"] });
      toast.success("Status atualizado.");
    },
  });

  const filtered = (certs.data ?? []).filter((c: any) => {
    if (!search) return true;
    const u = users.data?.find((x: any) => x.id === c.user_id);
    const co = courses.data?.find((x: any) => x.id === c.course_id);
    return [c.validation_code, u?.full_name, u?.email, co?.title].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Certificados emitidos</h2>
          <p className="text-xs text-muted-foreground">
            Consulte, valide e revogue certificados.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-72 pl-9"
            placeholder="Buscar código, aluno ou curso"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Curso</th>
              <th className="px-4 py-3">Emitido em</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((c: any) => {
              const u = users.data?.find((x: any) => x.id === c.user_id);
              const co = courses.data?.find((x: any) => x.id === c.course_id);
              const revoked = !!c.revoked_at || c.status === "revoked";
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-xs">{c.validation_code}</td>
                  <td className="px-4 py-3">
                    {c.student_name_snapshot || u?.full_name || u?.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.course_title_snapshot || co?.title || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(c.issued_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        revoked
                          ? "bg-destructive/15 text-destructive"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {revoked ? "Revogado" : "Válido"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/validar-certificado/$codigo"
                      params={{ codigo: c.validation_code }}
                      target="_blank"
                    >
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toggleRevoke.mutate({ id: c.id, revoked })
                      }
                    >
                      {revoked ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && !certs.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum certificado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ------------------- Helpers -------------------

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SkeletonBox() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-card/40" />
  );
}
