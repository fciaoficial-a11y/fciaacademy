import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PaidPlanId = "starter" | "pro" | "expert";
export type PaymentStatus =
  | "pending"
  | "received"
  | "confirmed"
  | "overdue"
  | "refunded"
  | "chargeback"
  | "cancelled"
  | "failed";

export interface PaymentSummary {
  id: string;
  plan_id: PaidPlanId;
  course_id: string | null;
  status: PaymentStatus;
  amount: number;
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  invoice_url: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export const PAID_PLAN_LABEL: Record<PaidPlanId, string> = {
  starter: "Starter",
  pro: "Pro",
  expert: "Expert",
};

export const PAID_PLAN_IDS: PaidPlanId[] = ["starter", "pro", "expert"];

export function isPaidPlanId(value: string): value is PaidPlanId {
  return PAID_PLAN_IDS.includes(value as PaidPlanId);
}

export function paymentQuery(paymentId: string | undefined) {
  return queryOptions({
    queryKey: ["payment", paymentId],
    enabled: !!paymentId,
    queryFn: async (): Promise<PaymentSummary | null> => {
      const { data, error } = await supabase
        .from("payments")
        .select(
          "id, plan_id, course_id, status, amount, pix_qr_code, pix_copy_paste, invoice_url, due_date, paid_at, created_at",
        )
        .eq("id", paymentId!)
        .maybeSingle();
      if (error) throw error;
      return (data as PaymentSummary | null) ?? null;
    },
  });
}

export function isPaymentApproved(status: PaymentStatus | undefined): boolean {
  return status === "received" || status === "confirmed";
}

export function isPaymentTerminal(status: PaymentStatus | undefined): boolean {
  return ["received", "confirmed", "refunded", "chargeback", "cancelled", "failed", "overdue"].includes(
    status ?? "",
  );
}