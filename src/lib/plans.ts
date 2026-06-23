import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PlanId = "free" | "starter" | "pro" | "expert";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  features: string[];
  sort_order: number;
}

export interface Subscription {
  id: string;
  plan_id: PlanId;
  status: string;
  started_at: string;
  expires_at: string | null;
}

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  expert: 3,
};

export function canAccess(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];
}

export const plansQuery = queryOptions({
  queryKey: ["plans"],
  queryFn: async (): Promise<Plan[]> => {
    const { data, error } = await supabase
      .from("plans" as never)
      .select("id, name, price, features, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((p: { id: string; name: string; price: number; features: unknown; sort_order: number }) => ({
      id: p.id as PlanId,
      name: p.name,
      price: Number(p.price),
      features: Array.isArray(p.features) ? (p.features as string[]) : [],
      sort_order: p.sort_order,
    }));
  },
});

export function currentSubscriptionQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["subscription", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await supabase
        .from("subscriptions" as never)
        .select("id, plan_id, status, started_at, expires_at")
        .eq("user_id", userId!)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as Subscription | null) ?? null;
    },
  });
}

export function currentPlanIdQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["current-plan", userId],
    enabled: !!userId,
    queryFn: async (): Promise<PlanId> => {
      const { data, error } = await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)("current_plan", { _user: userId });
      if (error) throw error;
      return ((data as string) ?? "free") as PlanId;
    },
  });
}

