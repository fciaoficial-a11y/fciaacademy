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
import {
  TEMPLATE_OPTIONS,
  type TemplateKey,
} from "@/lib/certificate-templates";

export const Route = createFileRoute("/_authenticated/admin/certificados")({
  component: AdminCertificatesPage,
});

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
      {/* Premium tech hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#111a3a] p-8 shadow-[0_20px_60px_-20px_rgba(34,211,238,0.35)]">
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,255,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              FCIA · DIGITAL CREDENTIAL SYSTEM
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Certificados premium tech
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Configure identidade institucional, escolha o modelo visual, ajuste regras
              de emissão e gerencie credenciais emitidas — tudo com preview real em
              alta fidelidade.
            </p>
          </div>
          <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur">
            <span className="text-cyan-300">ID</span>
            <span className="text-white/90">FCIA-2K26-{Math.floor(Math.random() * 900 + 100)}X</span>
            <span className="text-white/40">·</span>
            <span className="text-violet-300">SECURE</span>
          </div>
        </div>
      </section>

      <Tabs defaultValue="template" className="mt-8">
        <TabsList className="inline-flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-card/40 p-1 backdrop-blur">
          <TabsTrigger value="template" className="rounded-xl px-4">
            <Sparkles className="mr-2 h-4 w-4" /> Template
          </TabsTrigger>
          <TabsTrigger value="institucional" className="rounded-xl px-4">
            <Settings className="mr-2 h-4 w-4" /> Institucional
          </TabsTrigger>
          <TabsTrigger value="regras" className="rounded-xl px-4">
            <Sliders className="mr-2 h-4 w-4" /> Regras
          </TabsTrigger>
          <TabsTrigger value="gestao" className="rounded-xl px-4">
            <ShieldCheck className="mr-2 h-4 w-4" /> Emitidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-6">
          <TemplateTab />
        </TabsContent>
        <TabsContent value="institucional" className="mt-6">
          <InstitutionalTab />
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
  const selectedOpt = TEMPLATE_OPTIONS.find((t) => t.key === selected)!;

  return (
    <div className="space-y-8">
      {/* --- Model picker --- */}
      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              01 · Modelo visual
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold">
              Escolha a direção de arte da credencial
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Três direções fortemente diferenciadas — todas geram PDF em alta fidelidade
              com os mesmos campos dinâmicos.
            </p>
          </div>
          <div className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
            {TEMPLATE_OPTIONS.length} MODELS · A/B READY
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {TEMPLATE_OPTIONS.map((opt) => {
            const active = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, template_key: opt.key }))
                }
                className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 text-left transition-all duration-300 ${
                  active
                    ? "border-primary shadow-[0_20px_60px_-25px_rgba(59,111,245,0.6)]"
                    : "border-white/10 hover:border-primary/60 hover:-translate-y-0.5"
                }`}
              >
                {/* Accent halo when active */}
                {active && (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-70"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${opt.accent}22, transparent 60%)`,
                    }}
                  />
                )}
                <div className="aspect-[297/210] w-full overflow-hidden">
                  <PreviewCanvas
                    templateKey={opt.key}
                    institution={form.institution_name || "FCIA Academy"}
                    title={form.certificate_title || "Certificado de Conclusão"}
                    body="Concluiu com aproveitamento o curso livre de capacitação e atualização profissional."
                    legalFooter="Curso livre de capacitação."
                    issuerName={form.issuer_name || "Prof. Fernando Cabral"}
                    issuerRole={form.issuer_role || "CEO & Founder — FCIA"}
                    completionDate="21 · JULHO · 2026"
                    compact
                  />
                </div>
                <div className="relative flex flex-1 flex-col gap-2 border-t border-white/10 bg-card/70 p-5 backdrop-blur">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-base font-semibold">
                      {opt.name}
                    </p>
                    {active ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
                        style={{ backgroundColor: opt.accent }}
                      >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Selecionar
                      </span>
                    )}
                  </div>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: opt.accent }}
                  >
                    {opt.tagline}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Large preview --- */}
      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              02 · Prévia em alta fidelidade
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {selectedOpt.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Formato paisagem 297×210 — reflete o PDF final, com todos os campos
              dinâmicos aplicados.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            LIVE PREVIEW · SAMPLE DATA
          </div>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-3xl border-2 border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 20% 20%, ${selectedOpt.accent}22, transparent 50%), radial-gradient(circle at 80% 80%, ${selectedOpt.accent}22, transparent 50%)`,
            }}
          />
          <div className="relative mx-auto aspect-[297/210] w-full max-w-4xl overflow-hidden rounded-xl shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
            <PreviewCanvas
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
        </div>
      </div>

      {/* --- Editor --- */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
          03 · Conteúdo dinâmico
        </div>
        <h2 className="mt-1 font-display text-xl font-semibold">
          Ajuste o texto da credencial
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Campos disponíveis: <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{student_name}}"}</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{course_title}}"}</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{workload_hours}}"}</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{completion_date}}"}</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{institution_name}}"}</code>.
        </p>

        <Card className="mt-4">
          <div className="grid gap-4">
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
                rows={5}
                value={form.body_template ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body_template: e.target.value }))
                }
                placeholder={DEFAULT_TEMPLATE}
              />
            </Field>
            <Field label="Rodapé legal">
              <Textarea
                rows={3}
                value={form.legal_footer ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, legal_footer: e.target.value }))
                }
                placeholder={DEFAULT_FOOTER}
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              size="lg"
              className="rounded-xl"
            >
              {save.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar template
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---- Preview canvases — high-fidelity HTML reflection of each PDF template ----

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

function PreviewCanvas(props: CanvasProps) {
  if (props.templateKey === "executive_tech") return <ExecutiveTechPreview {...props} />;
  if (props.templateKey === "editorial_prestige") return <EditorialPrestigePreview {...props} />;
  return <DarkPremiumTechPreview {...props} />;
}

function ExecutiveTechPreview({
  institution,
  title,
  body,
  legalFooter,
  issuerName,
  issuerRole,
  completionDate,
  compact,
}: CanvasProps) {
  return (
    <div className="relative flex h-full w-full bg-[#f9f8f5] font-sans text-[#0b1632]">
      {/* Left navy rail */}
      <div className="relative flex w-[9%] flex-col items-center justify-between bg-[#0b1632] py-4">
        <span className="text-[6px] font-bold uppercase tracking-[0.4em] text-white [writing-mode:vertical-rl] rotate-180">
          {institution}
        </span>
        <span className="text-[5px] uppercase tracking-[0.3em] text-cyan-300/70 [writing-mode:vertical-rl] rotate-180">
          Digital Credential
        </span>
      </div>
      {/* Cyan hairline */}
      <div className="w-[0.5%] bg-[#0ea5e9]" />

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-[3.5%]">
        <div>
          <div className="flex items-center justify-between font-mono text-[7px] uppercase tracking-widest text-[#6b7590] sm:text-[9px]">
            <span>
              <span className="text-[#0ea5e9] font-bold">N°</span>{" "}
              <span className="font-bold text-[#0b1632]">{SAMPLE_CODE}</span>
            </span>
            <span className="font-bold">PROFESSIONAL PROGRAM</span>
          </div>
          <div className="mt-2 h-[2px] w-8 bg-[#0ea5e9]" />

          <p className="mt-[3%] font-bold uppercase tracking-[0.35em] text-[#0ea5e9] text-[8px] sm:text-[10px]">
            Certificado
          </p>
          <p className="mt-1 uppercase tracking-widest text-[#6b7590] text-[7px] sm:text-[9px]">
            {title}
          </p>

          <p
            className="mt-[4%] font-serif font-bold leading-[0.95] tracking-tight text-[#0b1632]"
            style={{
              fontSize: compact ? "1.35rem" : "clamp(1.75rem, 5.5vw, 3.5rem)",
            }}
          >
            {SAMPLE_STUDENT}
          </p>
          <div className="mt-2 h-[2px] w-14 bg-[#0ea5e9]" />

          {!compact && (
            <p className="mt-[3%] line-clamp-3 max-w-[92%] text-[10px] leading-relaxed text-[#2a324a] sm:text-xs">
              {body}
            </p>
          )}
        </div>

        {/* Meta strip */}
        <div className="mt-[3%] grid grid-cols-4 gap-3 font-mono">
          {[
            ["CARGA", `${SAMPLE_WORKLOAD}H`],
            ["CONCLUSÃO", completionDate.toUpperCase()],
            ["EMISSÃO", completionDate.toUpperCase()],
            ["VERIFY", "FCIA.ID"],
          ].map(([l, v]) => (
            <div key={l} className="border-t border-[#0b1632]/25 pt-1">
              <p className="text-[6px] font-bold tracking-widest text-[#6b7590] sm:text-[7px]">
                {l}
              </p>
              <p className="mt-0.5 text-[8px] font-bold text-[#0b1632] sm:text-[10px]">
                {v}
              </p>
            </div>
          ))}
        </div>

        {/* Signature + QR */}
        <div className="mt-[3%] flex items-end justify-between gap-3">
          <div className="min-w-0 max-w-[55%]">
            <div className="h-px w-full bg-[#0b1632]" />
            <p className="mt-1 font-serif text-[10px] font-bold sm:text-sm">{issuerName}</p>
            <p className="italic text-[7px] text-[#6b7590] sm:text-[9px]">{issuerRole}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              {/* Corner ticks */}
              {[
                "top-0 left-0",
                "top-0 right-0 rotate-90",
                "bottom-0 left-0 -rotate-90",
                "bottom-0 right-0 rotate-180",
              ].map((c) => (
                <span
                  key={c}
                  className={`pointer-events-none absolute h-2 w-2 border-l-2 border-t-2 border-[#0ea5e9] ${c}`}
                />
              ))}
              <div className="grid h-9 w-9 grid-cols-5 grid-rows-5 gap-[0.5px] border border-[#0b1632] bg-white p-[2px] sm:h-12 sm:w-12">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      [0, 3, 6, 9, 12, 14, 17, 21, 22, 24].includes(i)
                        ? "bg-[#0b1632]"
                        : "bg-white"
                    }
                  />
                ))}
              </div>
            </div>
            <p className="font-mono text-[6px] font-bold uppercase tracking-widest text-[#6b7590] sm:text-[7px]">
              VERIFY · {SAMPLE_CODE}
            </p>
          </div>
        </div>

        {!compact && (
          <p className="mt-2 max-w-[70%] text-[6px] italic leading-relaxed text-[#8b90a3] sm:text-[7px]">
            {legalFooter}
          </p>
        )}
      </div>
    </div>
  );
}

function DarkPremiumTechPreview({
  institution,
  title,
  body,
  legalFooter,
  issuerName,
  issuerRole,
  completionDate,
  compact,
}: CanvasProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050814] font-sans text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-400/25 blur-3xl" />
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-4 opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,255,1) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* HUD corner brackets */}
      {[
        "top-2 left-2",
        "top-2 right-2 rotate-90",
        "bottom-2 left-2 -rotate-90",
        "bottom-2 right-2 rotate-180",
      ].map((c) => (
        <span
          key={c}
          className={`pointer-events-none absolute h-4 w-4 border-l-2 border-t-2 border-cyan-400 ${c}`}
        />
      ))}
      {/* Inner subtle frame */}
      <div className="pointer-events-none absolute inset-3 rounded-[2px] border border-violet-400/30" />

      <div className="relative flex flex-1 flex-col justify-between px-[4%] py-[4%]">
        {/* Header row */}
        <div className="flex items-center justify-between font-mono text-[7px] uppercase tracking-[0.35em] sm:text-[9px]">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            <span className="font-bold text-cyan-300">{institution}</span>
            <span className="text-white/40">· DIGITAL CREDENTIAL</span>
          </div>
          <div className="rounded-sm border border-violet-400/40 bg-black/40 px-2 py-0.5 font-mono">
            <span className="text-cyan-300">ID</span>{" "}
            <span className="text-white">{SAMPLE_CODE}</span>
          </div>
        </div>

        {/* Center title block */}
        <div className="flex flex-col items-center text-center">
          <p className="font-mono uppercase tracking-[0.4em] text-white/50 text-[7px] sm:text-[9px]">
            OFFICIALLY ISSUED · VERIFIED
          </p>
          <p
            className="mt-[2%] font-display font-bold uppercase tracking-[0.15em] text-white"
            style={{
              fontSize: compact ? "0.9rem" : "clamp(1.2rem, 3.6vw, 2.3rem)",
            }}
          >
            {title}
          </p>
          <div className="mt-2 h-[2px] w-12 bg-cyan-400" />
          <p
            className="mt-[3%] font-display font-bold leading-[0.95] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-violet-200"
            style={{
              fontSize: compact ? "1.4rem" : "clamp(1.8rem, 5.5vw, 3.6rem)",
            }}
          >
            {SAMPLE_STUDENT}
          </p>
          {!compact && (
            <p className="mt-[2%] max-w-[85%] text-[10px] leading-relaxed text-white/75 sm:text-xs">
              {body}
            </p>
          )}
        </div>

        {/* Meta chips */}
        <div className="flex flex-col items-center gap-[3%]">
          <div className="grid w-full max-w-[90%] grid-cols-4 gap-2 font-mono">
            {[
              ["WORKLOAD", `${SAMPLE_WORKLOAD}H`],
              ["COMPLETED", completionDate.toUpperCase()],
              ["ISSUED", completionDate.toUpperCase()],
              ["TRACK", "FCIA · IA"],
            ].map(([l, v]) => (
              <div
                key={l}
                className="relative rounded-sm border border-violet-400/30 bg-black/30 px-2 py-1.5 backdrop-blur-sm"
              >
                <span className="absolute left-0 top-0 h-0.5 w-3 bg-cyan-400" />
                <p className="text-[6px] font-bold uppercase tracking-widest text-white/50 sm:text-[7px]">
                  {l}
                </p>
                <p className="mt-0.5 text-[8px] font-bold text-white sm:text-[10px]">
                  {v}
                </p>
              </div>
            ))}
          </div>

          {/* Signature + Holo QR */}
          <div className="flex w-full items-end justify-between gap-3">
            <div className="min-w-0 max-w-[55%]">
              <div className="h-px w-full bg-white/40" />
              <p className="mt-1 text-[10px] font-bold text-white sm:text-sm">{issuerName}</p>
              <p className="italic text-[7px] text-white/60 sm:text-[9px]">{issuerRole}</p>
            </div>
            <div className="relative flex flex-col items-center gap-1">
              {/* Halo */}
              <span className="pointer-events-none absolute inset-0 -m-2 rounded-full bg-cyan-400/25 blur-md" />
              <span className="pointer-events-none absolute inset-0 -m-1 rounded-full bg-violet-400/25 blur-md" />
              <div className="relative grid h-11 w-11 grid-cols-5 grid-rows-5 gap-[0.5px] bg-white p-[2px] sm:h-14 sm:w-14">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      [0, 2, 5, 7, 10, 12, 15, 18, 21, 23].includes(i)
                        ? "bg-[#050814]"
                        : "bg-white"
                    }
                  />
                ))}
              </div>
              <p className="relative font-mono text-[6px] font-bold uppercase tracking-widest text-cyan-300 sm:text-[7px]">
                SCAN · VERIFY
              </p>
            </div>
          </div>

          {!compact && (
            <p className="max-w-[75%] text-center text-[6px] italic leading-relaxed text-white/50 sm:text-[7px]">
              {legalFooter}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EditorialPrestigePreview({
  institution,
  title,
  body,
  legalFooter,
  issuerName,
  issuerRole,
  completionDate,
  compact,
}: CanvasProps) {
  const year = "2026";
  return (
    <div className="relative flex h-full w-full flex-col bg-[#faf7ef] font-serif text-[#1a1a1f]">
      {/* Double frame */}
      <div className="absolute inset-2 border border-[#1a1a1f]" />
      <div className="absolute inset-3 border border-[#b08050]" />
      {/* Corner ornaments */}
      {[
        "top-3 left-3",
        "top-3 right-3",
        "bottom-3 left-3",
        "bottom-3 right-3",
      ].map((c) => (
        <span
          key={c}
          className={`absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#b08050] ${c}`}
        />
      ))}

      <div className="relative flex flex-1 flex-col items-center px-[6%] py-[5%] text-center">
        {/* Header */}
        <p className="font-sans text-[7px] font-bold uppercase tracking-[0.5em] sm:text-[10px]">
          {institution}
        </p>
        <div className="mt-1 h-[1px] w-8 bg-[#b08050]" />

        {/* Big translucent year, top-right */}
        <span
          className="absolute right-[6%] top-[5%] font-serif text-[#b08050]/50 tracking-[0.15em]"
          style={{ fontSize: compact ? "1.4rem" : "clamp(1.6rem, 4vw, 2.8rem)" }}
        >
          {year}
        </span>

        {/* Title */}
        <p
          className="mt-[5%] font-serif leading-tight tracking-tight"
          style={{ fontSize: compact ? "1.1rem" : "clamp(1.6rem, 4.5vw, 3rem)" }}
        >
          {title}
        </p>

        {/* Concedido a */}
        <p className="mt-[2%] italic tracking-widest text-[#6a5f4d] text-[7px] sm:text-[10px]">
          · concedido a ·
        </p>

        {/* Student name */}
        <p
          className="mt-[2%] font-serif font-bold leading-[0.95] tracking-tight"
          style={{
            fontSize: compact ? "1.4rem" : "clamp(1.8rem, 5vw, 3.4rem)",
          }}
        >
          {SAMPLE_STUDENT}
        </p>
        <div className="mt-2 h-[1px] w-24 bg-[#b08050]" />

        {!compact && (
          <p className="mt-[2%] max-w-[80%] text-[9px] leading-relaxed text-[#3a3a44] sm:text-[11px]">
            {body}
          </p>
        )}

        <p className="mt-[2%] italic tracking-wide text-[#6a5f4d] text-[7px] sm:text-[10px]">
          carga horária de {SAMPLE_WORKLOAD}h · concluído em {completionDate}
        </p>

        {/* Spacer that pushes bottom row down */}
        <div className="flex-1" />

        {/* Signature centered */}
        <div className="w-full max-w-[60%]">
          <div className="mx-auto h-px w-full bg-[#1a1a1f]" />
          <p className="mt-1 font-serif text-[10px] font-bold sm:text-sm">{issuerName}</p>
          <p className="font-sans uppercase tracking-[0.3em] text-[#6a5f4d] text-[6px] sm:text-[8px]">
            {issuerRole}
          </p>
        </div>

        {/* Bottom row: code left / QR right */}
        <div className="mt-3 flex w-full items-end justify-between font-sans">
          <div className="text-left">
            <p className="text-[6px] font-bold uppercase tracking-[0.3em] text-[#6a5f4d] sm:text-[7px]">
              Código
            </p>
            <p className="font-mono text-[7px] sm:text-[9px]">{SAMPLE_CODE}</p>
            <p className="mt-1 text-[6px] font-bold uppercase tracking-[0.3em] text-[#6a5f4d] sm:text-[7px]">
              Emissão
            </p>
            <p className="font-serif italic text-[7px] sm:text-[9px]">{completionDate}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="grid h-8 w-8 grid-cols-4 grid-rows-4 gap-[1px] bg-white p-[1px] sm:h-10 sm:w-10">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={i % 2 === 0 ? "bg-[#1a1a1f]" : "bg-white"}
                />
              ))}
            </div>
            <p className="font-sans text-[6px] font-bold uppercase tracking-[0.35em] text-[#b08050] sm:text-[7px]">
              Validar
            </p>
          </div>
        </div>

        {!compact && (
          <p className="mt-2 max-w-[70%] font-sans text-[6px] italic leading-relaxed text-[#8b8479] sm:text-[7px]">
            {legalFooter}
          </p>
        )}
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

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl ${className ?? ""}`}
    >
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
