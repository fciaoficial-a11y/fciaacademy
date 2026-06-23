import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const LEVELS = [
  { name: "Iniciante", min: 0, max: 199 },
  { name: "Explorador", min: 200, max: 499 },
  { name: "Praticante", min: 500, max: 999 },
  { name: "Especialista", min: 1000, max: 2499 },
  { name: "Mestre FCIA", min: 2500, max: Infinity },
] as const;

export type LevelName = (typeof LEVELS)[number]["name"];

export function levelFromXp(xp: number) {
  const idx = LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const progress = next
    ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100))
    : 100;
  return {
    current: current.name as LevelName,
    next: next?.name as LevelName | undefined,
    progress,
    toNextXp: next ? next.min - xp : 0,
    floor: current.min,
    ceiling: next ? next.min : current.min,
  };
}

export interface GamificationProfile {
  xp: number;
  level: string;
  streak: number;
  full_name: string | null;
  avatar_url: string | null;
}

export interface XpEvent {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface AchievementRow {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  sort_order: number;
  unlocked_at: string | null;
}

const sb = supabase as unknown as {
  from: (t: string) => any;
  rpc: (name: string, args?: Record<string, unknown>) => any;
};

export function gamificationProfileQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["gamification", "profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<GamificationProfile> => {
      const { data, error } = await sb
        .from("profiles")
        .select("xp, level, streak, full_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (
        data ?? { xp: 0, level: "Iniciante", streak: 0, full_name: null, avatar_url: null }
      );
    },
  });
}

export function xpLogQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["gamification", "xp_log", userId],
    enabled: !!userId,
    queryFn: async (): Promise<XpEvent[]> => {
      const { data, error } = await sb
        .from("xp_log")
        .select("id, amount, reason, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as XpEvent[]) ?? [];
    },
  });
}

export function achievementsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["gamification", "achievements", userId],
    enabled: !!userId,
    queryFn: async (): Promise<AchievementRow[]> => {
      const [{ data: catalog, error: e1 }, { data: mine, error: e2 }] = await Promise.all([
        sb.from("achievements").select("*").order("sort_order"),
        sb.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", userId),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const map = new Map<string, string>(
        (mine ?? []).map((u: { achievement_id: string; unlocked_at: string }) => [
          u.achievement_id,
          u.unlocked_at,
        ]),
      );
      return ((catalog as Omit<AchievementRow, "unlocked_at">[]) ?? []).map((a) => ({
        ...a,
        unlocked_at: map.get(a.id) ?? null,
      }));
    },
  });
}

export async function registerDailyLogin() {
  const { data, error } = await sb.rpc("register_daily_login");
  if (error) throw error;
  return data?.[0] as { awarded: number; new_streak: number; new_xp: number } | undefined;
}

export function reasonLabel(reason: string): string {
  switch (reason) {
    case "module_complete":
      return "Módulo concluído";
    case "course_complete":
      return "Curso concluído";
    case "first_course_bonus":
      return "Bônus: primeiro curso";
    case "daily_login":
      return "Login diário";
    default:
      return reason;
  }
}
