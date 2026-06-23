import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Crown,
  Flame,
  Footprints,
  Lock,
  Mountain,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import {
  achievementsQuery,
  gamificationProfileQuery,
  levelFromXp,
  reasonLabel,
  xpLogQuery,
  type AchievementRow,
} from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/evolucao")({
  head: () => ({
    meta: [
      { title: "Evolução — FCIA Academy" },
      { name: "description", content: "Seu XP, nível e conquistas na FCIA Academy." },
    ],
  }),
  component: EvolucaoPage,
});

const ICONS: Record<string, typeof Trophy> = {
  Footprints,
  Flame,
  Target,
  Mountain,
  Crown,
  Trophy,
};

function EvolucaoPage() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const profile = useQuery(gamificationProfileQuery(userId));
  const log = useQuery(xpLogQuery(userId));
  const ach = useQuery(achievementsQuery(userId));

  const xp = profile.data?.xp ?? 0;
  const streak = profile.data?.streak ?? 0;
  const lvl = levelFromXp(xp);

  return (
    <div className="relative mx-auto max-w-7xl px-6 py-12">
      <div className="absolute inset-0 -z-10 tech-grid opacity-20" aria-hidden />

      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Sua evolução
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Continue subindo de <span className="text-gradient">nível</span>
      </h1>

      {/* Top widgets */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Zap} label="XP total" value={xp.toLocaleString("pt-BR")} hint="pontos acumulados" />
        <StatCard icon={Trophy} label="Nível atual" value={lvl.current} hint={lvl.next ? `Próximo: ${lvl.next}` : "Nível máximo"} />
        <StatCard icon={Flame} label="Streak" value={`${streak} ${streak === 1 ? "dia" : "dias"}`} hint="logins consecutivos" />
      </div>

      {/* Level progress */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{lvl.current}</span>
          <span className="text-muted-foreground">
            {lvl.next ? `${lvl.toNextXp} XP para ${lvl.next}` : "Nível máximo atingido"}
          </span>
        </div>
        <Progress value={lvl.progress} className="mt-3 h-2" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{lvl.floor} XP</span>
          <span>{lvl.ceiling} XP</span>
        </div>
      </div>

      {/* Achievements */}
      <h2 className="mt-12 font-display text-xl font-semibold">Conquistas</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ach.data?.map((a) => (
          <AchievementCard key={a.id} achievement={a} />
        ))}
        {ach.isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/5 bg-card/40" />
          ))}
      </div>

      {/* XP history */}
      <h2 className="mt-12 font-display text-xl font-semibold">Histórico de XP</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl">
        {log.data && log.data.length > 0 ? (
          <ul className="divide-y divide-white/5">
            {log.data.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div>
                  <div className="font-medium">{reasonLabel(ev.reason)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(ev.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <span className="font-mono text-sm font-semibold text-primary">
                  +{ev.amount} XP
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Nenhum evento ainda. Comece um{" "}
            <Link to="/cursos" className="text-primary underline-offset-4 hover:underline">
              curso
            </Link>{" "}
            para ganhar XP.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" aria-hidden />
      <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="relative mt-4 font-display text-2xl font-semibold">{value}</div>
      <div className="relative text-sm text-muted-foreground">{label}</div>
      <div className="relative mt-1 text-xs text-muted-foreground/70">{hint}</div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: AchievementRow }) {
  const Icon = ICONS[achievement.icon] ?? Trophy;
  const unlocked = !!achievement.unlocked_at;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all ${
        unlocked
          ? "border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10"
          : "border-white/10 bg-card/40 opacity-70"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            unlocked
              ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-sm font-semibold">{achievement.title}</h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              +{achievement.xp_reward} XP
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{achievement.description}</p>
          {unlocked && achievement.unlocked_at && (
            <p className="mt-2 text-[11px] text-primary">
              Desbloqueado em {new Date(achievement.unlocked_at).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
