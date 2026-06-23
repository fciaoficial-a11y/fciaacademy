import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Activity, Award, BookOpen, Crown, Flame, Sparkles, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { myCertificatesQuery } from "@/lib/certificate-queries";
import { gamificationProfileQuery, levelFromXp } from "@/lib/gamification";
import { currentPlanIdQuery, plansQuery } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FCIA Academy" },
      { name: "description", content: "Seu painel na FCIA Academy." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
      setEmail(data.user?.email ?? "");
    });
  }, []);

  const certificates = useQuery(myCertificatesQuery(userId));
  const gam = useQuery(gamificationProfileQuery(userId));
  const planId = useQuery(currentPlanIdQuery(userId));
  const plans = useQuery(plansQuery);
  const currentPlan = plans.data?.find((p) => p.id === (planId.data ?? "free"));

  const certCount = certificates.data?.length ?? 0;
  const xp = gam.data?.xp ?? 0;
  const streak = gam.data?.streak ?? 0;
  const lvl = levelFromXp(xp);
  const name = gam.data?.full_name ?? email.split("@")[0] ?? "";

  return (
    <div className="relative mx-auto max-w-7xl px-6 py-12">
      <div className="absolute inset-0 -z-10 tech-grid opacity-20" aria-hidden />

      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Dashboard
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Olá, <span className="text-gradient">{name || "explorer"}</span> 👋
      </h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Continue sua jornada de aprendizado e acompanhe suas conquistas.
      </p>

      {/* Gamification hero */}
      <Link
        to="/evolucao"
        className="mt-8 block overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card/60 to-accent/15 p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/40"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Nível</div>
              <div className="font-display text-xl font-semibold">{lvl.current}</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /><span className="font-semibold">{xp}</span> XP</div>
            <div className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-orange-400" /><span className="font-semibold">{streak}</span>d streak</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={lvl.progress} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{lvl.current}</span>
            <span>{lvl.next ? `${lvl.toNextXp} XP para ${lvl.next}` : "Nível máximo"}</span>
          </div>
        </div>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: "Cursos ativos", value: "—", to: "/cursos" as const },
          { icon: Activity, label: "Horas estudadas", value: "0h", to: "/cursos" as const },
          {
            icon: Award,
            label: "Certificados conquistados",
            value: String(certCount),
            to: "/certificados" as const,
          },
        ].map(({ icon: Icon, label, value, to }) => (
          <Link
            key={label}
            to={to}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div
              className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/25"
              aria-hidden
            />
            <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="relative mt-4 font-display text-2xl font-semibold">{value}</div>
            <div className="relative text-sm text-muted-foreground">{label}</div>
          </Link>
        ))}
      </div>

      <Link
        to="/planos"
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/40"
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Plano atual</div>
            <div className="font-display text-lg font-semibold">{currentPlan?.name ?? "Free"}</div>
          </div>
        </div>
        <span className="text-sm font-medium text-primary">Ver planos →</span>
      </Link>

      <div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-8">
        <h2 className="font-display text-xl font-semibold">Próximos passos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Conclua os módulos do curso e seja aprovado no quiz (nota mínima 70%) para
          desbloquear seu certificado.
        </p>
      </div>
    </div>
  );
}

