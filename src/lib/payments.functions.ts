import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PaidPlanId, PaymentStatus } from "@/lib/payments";
import type { Json } from "@/integrations/supabase/types";

const inputSchema = z.object({
  planId: z.enum(["starter", "pro", "expert"]),
  courseId: z.string().uuid().optional(),
});

const PLAN_RANK: Record<PaidPlanId | "free", number> = {
  free: 0,
  starter: 1,
  pro: 2,
  expert: 3,
};

interface AsaasCustomerResponse {
  id: string;
}

interface AsaasPaymentResponse {
  id: string;
  status?: string;
  value?: number;
  dueDate?: string;
  invoiceUrl?: string;
  billingType?: string;
}

interface AsaasPixResponse {
  encodedImage?: string;
  payload?: string;
}

export interface PixChargeResult {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  planId: PaidPlanId;
  courseId: string | null;
  pixQrCode: string | null;
  pixCopyPaste: string | null;
  invoiceUrl: string | null;
  dueDate: string | null;
}

export const createPixCharge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<PixChargeResult> => {
    const apiKey = process.env.ASAAS_API_KEY;
    if (!apiKey) {
      throw new Error("ASAAS_API_KEY não está disponível no ambiente seguro do backend.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: plan, error: planError } = await context.supabase
      .from("plans")
      .select("id, name, price, is_active")
      .eq("id", data.planId)
      .eq("is_active", true)
      .maybeSingle();
    if (planError) throw planError;
    if (!plan || Number(plan.price) <= 0) throw new Error("Plano pago não encontrado.");

    if (data.courseId) {
      const { data: course, error: courseError } = await context.supabase
        .from("courses")
        .select("id, title, is_published, tracks:track_id(required_plan)")
        .eq("id", data.courseId)
        .maybeSingle();
      if (courseError) throw courseError;
      if (!course?.is_published) throw new Error("Curso indisponível para matrícula.");

      const track = (course as unknown as { tracks: { required_plan: string } | null }).tracks;
      const requiredPlan = (track?.required_plan ?? "free") as keyof typeof PLAN_RANK;
      if (PLAN_RANK[data.planId] < PLAN_RANK[requiredPlan]) {
        throw new Error(`Este curso exige o plano ${requiredPlan.toUpperCase()}.`);
      }
    }

    const reusable = await findReusablePendingPayment(context.userId, data.planId, data.courseId ?? null);
    if (reusable) return reusable;

    const profile = await getCheckoutProfile(context.userId, context.claims as { email?: string });
    const customer = await asaasFetch<AsaasCustomerResponse>("/customers", apiKey, {
      method: "POST",
      body: JSON.stringify({ name: profile.name, email: profile.email }),
    });

    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const charge = await asaasFetch<AsaasPaymentResponse>("/payments", apiKey, {
      method: "POST",
      body: JSON.stringify({
        customer: customer.id,
        billingType: "PIX",
        value: Number(plan.price),
        dueDate,
        description: `FCIA Academy — Plano ${plan.name}`,
        externalReference: JSON.stringify({ userId: context.userId, planId: data.planId, courseId: data.courseId ?? null }),
      }),
    });

    const pix = await asaasFetch<AsaasPixResponse>(`/payments/${charge.id}/pixQrCode`, apiKey, {
      method: "GET",
    });

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: context.userId,
        course_id: data.courseId ?? null,
        plan_id: data.planId,
        provider: "asaas",
        provider_payment_id: charge.id,
        status: normalizePaymentStatus(charge.status),
        amount: Number(charge.value ?? plan.price),
        billing_type: "PIX",
        pix_qr_code: pix.encodedImage ?? null,
        pix_copy_paste: pix.payload ?? null,
        invoice_url: charge.invoiceUrl ?? null,
        due_date: charge.dueDate ?? dueDate,
        raw_payload: { charge: charge as unknown as Json, pix: pix as unknown as Json },
      })
      .select("id, plan_id, course_id, status, amount, pix_qr_code, pix_copy_paste, invoice_url, due_date")
      .single();

    if (insertError) throw insertError;

    return {
      paymentId: inserted.id,
      status: inserted.status as PaymentStatus,
      amount: Number(inserted.amount),
      planId: inserted.plan_id as PaidPlanId,
      courseId: inserted.course_id,
      pixQrCode: inserted.pix_qr_code,
      pixCopyPaste: inserted.pix_copy_paste,
      invoiceUrl: inserted.invoice_url,
      dueDate: inserted.due_date,
    };
  });

async function getCheckoutProfile(userId: string, claims: { email?: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin.from("profiles").select("full_name").eq("id", userId).maybeSingle();
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
  const email = claims.email ?? authUser.user?.email;
  if (!email) throw new Error("E-mail do usuário não encontrado para gerar cobrança.");
  return { email, name: profile?.full_name || email.split("@")[0] || "Aluno FCIA" };
}

async function findReusablePendingPayment(userId: string, planId: PaidPlanId, courseId: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const freshSince = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  let query = supabaseAdmin
    .from("payments")
    .select("id, plan_id, course_id, status, amount, pix_qr_code, pix_copy_paste, invoice_url, due_date")
    .eq("user_id", userId)
    .eq("plan_id", planId)
    .eq("status", "pending")
    .gte("created_at", freshSince)
    .order("created_at", { ascending: false })
    .limit(1);

  query = courseId ? query.eq("course_id", courseId) : query.is("course_id", null);
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return {
    paymentId: data.id,
    status: data.status as PaymentStatus,
    amount: Number(data.amount),
    planId: data.plan_id as PaidPlanId,
    courseId: data.course_id,
    pixQrCode: data.pix_qr_code,
    pixCopyPaste: data.pix_copy_paste,
    invoiceUrl: data.invoice_url,
    dueDate: data.due_date,
  } satisfies PixChargeResult;
}

async function asaasFetch<T>(path: string, apiKey: string, init: RequestInit): Promise<T> {
  const response = await fetch(`https://api.asaas.com/v3${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...init.headers,
    },
  });
  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;
  if (!response.ok) {
    console.error("Asaas sandbox request failed", { status: response.status, path, body });
    throw new Error("Falha ao criar cobrança PIX no Asaas sandbox.");
  }
  return body as T;
}

function normalizePaymentStatus(status: string | undefined): PaymentStatus {
  const normalized = (status ?? "pending").toLowerCase();
  if (normalized === "received") return "received";
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "overdue") return "overdue";
  if (normalized === "refunded") return "refunded";
  if (normalized === "chargeback") return "chargeback";
  if (normalized === "deleted" || normalized === "cancelled" || normalized === "canceled") return "cancelled";
  return "pending";
}