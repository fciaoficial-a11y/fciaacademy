import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Award,
  BookOpen,
  Flame,
  Linkedin,
  Loader2,
  Sparkles,
  Trophy,
  Upload,
  User2,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  achievementsQuery,
  gamificationProfileQuery,
  levelFromXp,
} from "@/lib/gamification";
import { myCertificatesQuery } from "@/lib/certificate-queries";
import { inProgressCoursesQuery } from "@/lib/profile-queries";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — FCIA Academy" },
      { name: "description", content: "Seu perfil, jornada, XP, nível e conquistas." },
    ],
  }),
  component: ProfilePage,
});

interface ProfileForm {
  full_name: string;
  bio: string;
  linkedin_url: string;
}

function ProfilePage() {
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [form, setForm] = useState<ProfileForm>({ full_name: "", bio: "", linkedin_url: "" });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || !mounted) return;
      setUserId(u.user.id);
      setEmail(u.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, linkedin_url")
        .eq("id", u.user.id)
        .maybeSingle();
      if (!mounted) return;
      const p = data as { full_name: string | null; avatar_url: string | null; bio: string | null; linkedin_url: string | null } | null;
      setForm({
        full_name: p?.full_name ?? "",
        bio: p?.bio ?? "",
        linkedin_url: p?.linkedin_url ?? "",
      });
      setAvatarPath(p?.avatar_url ?? null);
      if (p?.avatar_url) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl(p.avatar_url, 3600);
        if (mounted) setAvatarUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        bio: form.bio || null,
        linkedin_url: form.linkedin_url || null,
      })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar perfil");
      return;
    }
    toast.success("Perfil atualizado");
  }

  async function handleAvatarUpload(file: File) {
    if (!userId) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      toast.error("Falha no upload do avatar");
      return;
    }
    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", userId);
    if (dbErr) {
      setUploading(false);
      toast.error("Erro ao atualizar perfil");
      return;
    }
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 3600);
    setAvatarPath(path);
    setAvatarUrl(signed?.signedUrl ?? null);
    setUploading(false);
    toast.success("Avatar atualizado");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const initials = (form.full_name || email)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Seu perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Centro de identidade, progresso e conquistas na FCIA Academy.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* COLUNA ESQUERDA — Identidade */}
        <section className="space-y-8 rounded-2xl border border-white/10 bg-card/60 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold">
                  {initials || <User2 className="h-6 w-6" />}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleAvatarUpload(f);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {avatarPath ? "Trocar avatar" : "Enviar avatar"}
              </Button>
              <span className="text-xs text-muted-foreground">PNG ou JPG até ~2MB</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Como você quer ser chamado?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Uma frase sobre você — área, objetivo, o que busca aprender."
              rows={3}
              maxLength={280}
            />
            <div className="text-right text-[11px] text-muted-foreground">
              {form.bio.length}/280
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="inline-flex items-center gap-1.5">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </Label>
            <Input
              id="linkedin_url"
              value={form.linkedin_url}
              onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
              placeholder="https://linkedin.com/in/seu-usuario"
              type="url"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
        </section>

        {/* COLUNA DIREITA — Jornada */}
        <JourneyColumn userId={userId} hasBio={Boolean(form.bio)} />
      </div>
    </div>
  );
}

function JourneyColumn({ userId, hasBio }: { userId: string; hasBio: boolean }) {
  const gam = useQuery(gamificationProfileQuery(userId));
  const ach = useQuery(achievementsQuery(userId));
  const certs = useQuery(myCertificatesQuery(userId));
  
  const inProgress = useQuery(inProgressCoursesQuery(userId));

  const xp = gam.data?.xp ?? 0;
  const streak = gam.data?.streak ?? 0;
  const lvl = levelFromXp(xp);
  const unlocked = (ach.data ?? []).filter((a) => a.unlocked_at);
  const certList = certs.data ?? [];
  const inProgressList = inProgress.data ?? [];

  // Próximo passo recomendado
  const nextStep = (() => {
    if (inProgressList.length > 0) {
      const c = inProgressList[0];
      return {
        label: `Continuar "${c.title}"`,
        to: "/curso/$slug" as const,
        params: { slug: c.slug },
      };
    }
    if (certList.length === 0) {
      return { label: "Explorar trilhas", to: "/trilhas" as const, params: undefined };
    }
    return { label: "Ver evolução", to: "/evolucao" as const, params: undefined };
  })();

  return (
    <div className="space-y-6">
      {/* Header de jornada */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Nível</div>
            <div className="font-display text-2xl font-semibold">{lvl.current}</div>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <b>{xp}</b> XP
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-400" />
              <b>{streak}</b>d
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" />
              <b>{certList.length}</b> cert.
            </span>
          </div>
        </div>
        <Progress value={lvl.progress} className="mt-4 h-2" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{lvl.floor} XP</span>
          <span>{lvl.next ? `${lvl.toNextXp} XP para ${lvl.next}` : "Nível máximo"}</span>
        </div>
      </div>

      {/* Próximo passo */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Próximo passo
        </div>
        <div className="mt-2 text-sm font-semibold text-foreground">{nextStep.label}</div>
        <Link
          to={nextStep.to}
          params={nextStep.params as never}
          className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
        >
          Começar agora →
        </Link>
      </div>

      {/* Cursos em andamento */}
      <div className="rounded-2xl border border-white/10 bg-card/60 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Cursos em andamento</h2>
          <Link to="/dashboard" className="text-xs text-primary hover:underline">
            Dashboard →
          </Link>
        </div>
        {inProgressList.length === 0 ? (
          <EmptyRow
            icon={<BookOpen className="h-4 w-4" />}
            text="Nenhum curso iniciado ainda."
            ctaLabel="Ver trilhas"
            ctaTo="/trilhas"
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {inProgressList.slice(0, 4).map((c) => {
              const pct = c.total_modules
                ? Math.round((c.completed_modules / c.total_modules) * 100)
                : 0;
              return (
                <li key={c.course_id}>
                  <Link
                    to="/curso/$slug"
                    params={{ slug: c.slug }}
                    className="block rounded-lg border border-white/5 bg-background/40 p-3 transition-colors hover:bg-background/70"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.completed_modules}/{c.total_modules}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-2 h-1.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Certificados */}
      <div className="rounded-2xl border border-white/10 bg-card/60 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Certificados</h2>
          <Link to="/certificados" className="text-xs text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        {certList.length === 0 ? (
          <EmptyRow
            icon={<Award className="h-4 w-4" />}
            text="Nenhum certificado ainda. Conclua um curso para começar."
            ctaLabel="Explorar trilhas"
            ctaTo="/trilhas"
          />
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {certList.slice(0, 3).map((c) => (
              <li key={c.id}>
                <Link
                  to="/certificados/$id"
                  params={{ id: c.id }}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-background/40 px-3 py-2 hover:bg-background/70"
                >
                  <span className="truncate">{c.courses?.title ?? "Curso"}</span>
                  <span className="ml-3 text-xs text-muted-foreground">
                    {new Date(c.issued_at).toLocaleDateString("pt-BR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Conquistas */}
      <div className="rounded-2xl border border-white/10 bg-card/60 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Conquistas</h2>
          <Link to="/evolucao" className="text-xs text-primary hover:underline">
            Ver evolução →
          </Link>
        </div>
        {unlocked.length === 0 ? (
          <EmptyRow
            icon={<Trophy className="h-4 w-4" />}
            text="Nenhuma conquista ainda. Complete um módulo para desbloquear."
            ctaLabel="Ver trilhas"
            ctaTo="/trilhas"
          />
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {unlocked.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                <Trophy className="h-3 w-3" /> {a.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {!hasBio && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-card/30 p-5 text-sm text-muted-foreground">
          Adicione uma bio para completar seu perfil e contar sua história aos outros alunos.
        </div>
      )}
    </div>
  );
}

function EmptyRow({
  icon,
  text,
  ctaLabel,
  ctaTo,
}: {
  icon: React.ReactNode;
  text: string;
  ctaLabel: string;
  ctaTo: "/trilhas" | "/dashboard" | "/evolucao";
}) {
  return (
    <div className="mt-4 flex flex-col items-start gap-3 rounded-lg border border-dashed border-white/10 bg-background/30 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span className="inline-flex items-center gap-2">
        {icon}
        {text}
      </span>
      <Link
        to={ctaTo}
        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}
