import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Award, Flame, Loader2, Trophy, Upload, User2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  achievementsQuery,
  gamificationProfileQuery,
  levelFromXp,
} from "@/lib/gamification";
import { myCertificatesQuery } from "@/lib/certificate-queries";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — FCIA Academy" },
      { name: "description", content: "Seu perfil, XP, nível e conquistas." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
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
        .select("full_name, avatar_url")
        .eq("id", u.user.id)
        .maybeSingle();
      if (!mounted) return;
      setFullName(data?.full_name ?? "");
      setAvatarPath(data?.avatar_url ?? null);
      if (data?.avatar_url) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl(data.avatar_url, 3600);
        if (mounted) setAvatarUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
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

  const initials = (fullName || email)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Seu perfil</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Atualize seu nome de exibição e sua foto.
      </p>

      <div className="mt-10 space-y-8 rounded-2xl border border-white/10 bg-card/60 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
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
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
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
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Como você quer ser chamado?"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>

      <GamificationSection userId={userId} />
    </div>
  );
}

function GamificationSection({ userId }: { userId: string }) {
  const gam = useQuery(gamificationProfileQuery(userId));
  const ach = useQuery(achievementsQuery(userId));
  const certs = useQuery(myCertificatesQuery(userId));

  const xp = gam.data?.xp ?? 0;
  const streak = gam.data?.streak ?? 0;
  const lvl = levelFromXp(xp);
  const unlocked = (ach.data ?? []).filter((a) => a.unlocked_at);
  const certCount = certs.data?.length ?? 0;

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Nível</div>
            <div className="font-display text-2xl font-semibold">{lvl.current}</div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /><b>{xp}</b> XP</span>
            <span className="inline-flex items-center gap-1.5"><Flame className="h-4 w-4 text-orange-400" /><b>{streak}</b>d</span>
            <span className="inline-flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" /><b>{certCount}</b> cert.</span>
          </div>
        </div>
        <Progress value={lvl.progress} className="mt-4 h-2" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{lvl.floor} XP</span>
          <span>{lvl.next ? `${lvl.toNextXp} XP para ${lvl.next}` : "Nível máximo"}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/60 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Conquistas</h2>
          <Link to="/evolucao" className="text-xs text-primary hover:underline">Ver evolução →</Link>
        </div>
        {unlocked.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhuma conquista ainda. Complete um módulo para começar.
          </p>
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
    </div>
  );
}
