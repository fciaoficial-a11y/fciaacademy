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
        legal_name: form.legal_name ?? null,
        cnpj: form.cnpj ?? null,
        issuer_name: form.issuer_name ?? "",
        issuer_role: form.issuer_role ?? "",
        validation_base_url: form.validation_base_url ?? "",
        logo_url: form.logo_url ?? null,
        signature_image_url: form.signature_image_url ?? null,
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

  const preview = useMemo(
    () =>
      applyTemplate(form.body_template || DEFAULT_TEMPLATE, {
        student_name: "Fernando Aluno da Silva",
        course_title: "Introdução à IA Generativa",
        workload_hours: 20,
        completion_date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        institution_name: form.institution_name || "FCIA Academy",
      }),
    [form.body_template, form.institution_name]
  );

  if (isLoading) return <SkeletonBox />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="font-display text-lg font-semibold">Editar template</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Placeholders: <code>{"{{student_name}}"}</code>, <code>{"{{course_title}}"}</code>,{" "}
          <code>{"{{workload_hours}}"}</code>, <code>{"{{completion_date}}"}</code>,{" "}
          <code>{"{{institution_name}}"}</code>
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
          <h2 className="font-display text-lg font-semibold">Prévia em tempo real</h2>
        </div>
        <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/10 p-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/80">
            {form.institution_name || "FCIA Academy"}
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">
            {form.certificate_title || "Certificado de Conclusão"}
          </h3>
          <p className="mt-4 font-display text-lg text-primary">
            Fernando Aluno da Silva
          </p>
          <p className="mt-4 text-xs leading-relaxed text-slate-300">{preview}</p>
          <p className="mt-6 border-t border-white/10 pt-4 text-[10px] italic leading-relaxed text-slate-400">
            {form.legal_footer || DEFAULT_FOOTER}
          </p>
        </div>
      </Card>
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
