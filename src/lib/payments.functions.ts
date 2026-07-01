import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PaymentStatus } from "@/lib/payments";
import type { Json } from "@/integrations/supabase/types";

const cpfCnpjSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 11 || v.length === 14, "CPF ou CNPJ inválido.");

// LEGACY: `mode: "plan"` foi descontinuado. A validação aceita o valor apenas
// para não quebrar chamadas antigas em cache, mas o handler recusa qualquer
// checkout que não seja compra avulsa de curso.
const inputSchema = z
  .object({
    mode: z.enum(["plan", "course"]).default("course"),
    planId: z.enum(["starter", "pro", "expert"]).optional(),
    courseId: z.string().uuid().optional(),
    cpfCnpj: cpfCnpjSchema.optional(),
  })
  .refine((v) => !!v.courseId, {
    message: "courseId é obrigatório — checkout por plano está desativado.",
  });

const syncPaymentSchema = z.object({
  paymentId: z.string().uuid(),
});

interface AsaasCustomerResponse { id: string }
interface AsaasPaymentResponse {
  id: string; status?: string; value?: number; dueDate?: string; invoiceUrl?: string; billingType?: string;
  paymentDate?: string | null; confirmedDate?: string | null;
}
interface AsaasPixResponse { encodedImage?: string; payload?: string }

export interface PixChargeResult {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  planId: string;
  courseId: string | null;
  pixQrCode: string | null;
  pixCopyPaste: string | null;
  invoiceUrl: string | null;
  dueDate: string | null;
}

export interface PaymentSyncResult {
  id: string;
  plan_id: string;
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

export const createPixCharge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<PixChargeResult> => {
    const apiKey = process.env.ASAAS_API_KEY;
    if (!apiKey) throw new Error("ASAAS_API_KEY não está disponível no ambiente seguro do backend.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let amount = 0;
    let description = "FCIA Academy";
    const planIdForRecord = "course_purchase";
    const courseId = data.courseId ?? null;

    // Único caminho ativo: compra avulsa de curso.
    // Regra de acesso: course.price === 0 → livre; course.price > 0 → pagamento + enrollment.
    {
      const { data: course, error: courseError } = await context.supabase
        .from("courses").select("id, title, price, is_published").eq("id", courseId!).maybeSingle();
      if (courseError) throw courseError;
      if (!course?.is_published) throw new Error("Curso indisponível.");
      const price = Number((course as { price: number }).price ?? 0);
      if (price <= 0) throw new Error("Este curso é gratuito — não requer compra.");
      amount = price;
      description = `FCIA Academy — ${course.title}`;
    }


    const reusable = await findReusablePendingPayment(context.userId, planIdForRecord, courseId);
    if (reusable) return reusable;

    const profile = await getCheckoutProfile(context.userId, context.claims as { email?: string });
    const cpfCnpj = data.cpfCnpj ?? profile.cpfCnpj;
    if (!cpfCnpj) {
      throw new Error("CPF_REQUIRED");
    }
    if (data.cpfCnpj && data.cpfCnpj !== profile.cpfCnpj) {
      await supabaseAdmin.from("profiles").update({ cpf_cnpj: data.cpfCnpj }).eq("id", context.userId);
    }

    const customer = await asaasFetch<AsaasCustomerResponse>("/customers", apiKey, {
      method: "POST",
      body: JSON.stringify({ name: profile.name, email: profile.email, cpfCnpj }),
    });

    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const charge = await asaasFetch<AsaasPaymentResponse>("/payments", apiKey, {
      method: "POST",
      body: JSON.stringify({
        customer: customer.id,
        billingType: "PIX",
        value: amount,
        dueDate,
        description,
        externalReference: context.userId,
      }),
    });

    const pix = await asaasFetch<AsaasPixResponse>(`/payments/${charge.id}/pixQrCode`, apiKey, { method: "GET" });

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: context.userId,
        course_id: courseId,
        plan_id: planIdForRecord,
        provider: "asaas",
        provider_payment_id: charge.id,
        status: normalizePaymentStatus(charge.status),
        amount: Number(charge.value ?? amount),
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
      planId: inserted.plan_id,
      courseId: inserted.course_id,
      pixQrCode: inserted.pix_qr_code,
      pixCopyPaste: inserted.pix_copy_paste,
      invoiceUrl: inserted.invoice_url,
      dueDate: inserted.due_date,
    };
  });

export const syncPixPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => syncPaymentSchema.parse(data))
  .handler(async ({ data, context }): Promise<PaymentSyncResult | null> => {
    const apiKey = process.env.ASAAS_API_KEY;
    if (!apiKey) throw new Error("ASAAS_API_KEY não está disponível no ambiente seguro do backend.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: payment, error: readError } = await context.supabase
      .from("payments")
      .select("id, user_id, plan_id, course_id, provider_payment_id, status, amount, pix_qr_code, pix_copy_paste, invoice_url, due_date, paid_at, created_at")
      .eq("id", data.paymentId)
      .maybeSingle();

    if (readError) throw readError;
    if (!payment) return null;

    const wasPaid = isPaidStatus(payment.status as PaymentStatus);
    if (!wasPaid && payment.provider_payment_id) {
      const remote = await asaasFetch<AsaasPaymentResponse>(`/payments/${payment.provider_payment_id}`, apiKey, { method: "GET" });
      const newStatus = normalizePaymentStatus(remote.status);
      const isPaid = isPaidStatus(newStatus);
      const paidAt = isPaid ? remote.paymentDate ?? remote.confirmedDate ?? new Date().toISOString() : null;

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("payments")
        .update({
          status: newStatus,
          amount: Number(remote.value ?? payment.amount),
          billing_type: remote.billingType ?? "PIX",
          invoice_url: remote.invoiceUrl ?? payment.invoice_url,
          due_date: remote.dueDate ?? payment.due_date,
          paid_at: paidAt ?? payment.paid_at,
          raw_payload: { reconciled_charge: remote as unknown as Json },
        })
        .eq("id", payment.id)
        .select("id, plan_id, course_id, status, amount, pix_qr_code, pix_copy_paste, invoice_url, due_date, paid_at, created_at")
        .single();

      if (updateError) throw updateError;

      if (isPaid) {
        const { error: grantError } = await supabaseAdmin.rpc("grant_paid_access", {
          _user_id: payment.user_id,
          _plan_id: payment.plan_id,
          _course_id: payment.course_id ?? undefined,
        });
        if (grantError) throw grantError;
      }

      return {
        id: updated.id,
        plan_id: updated.plan_id,
        course_id: updated.course_id,
        status: updated.status as PaymentStatus,
        amount: Number(updated.amount),
        pix_qr_code: updated.pix_qr_code,
        pix_copy_paste: updated.pix_copy_paste,
        invoice_url: updated.invoice_url,
        due_date: updated.due_date,
        paid_at: updated.paid_at,
        created_at: updated.created_at,
      };
    }

    return {
      id: payment.id,
      plan_id: payment.plan_id,
      course_id: payment.course_id,
      status: payment.status as PaymentStatus,
      amount: Number(payment.amount),
      pix_qr_code: payment.pix_qr_code,
      pix_copy_paste: payment.pix_copy_paste,
      invoice_url: payment.invoice_url,
      due_date: payment.due_date,
      paid_at: payment.paid_at,
      created_at: payment.created_at,
    };
  });

async function getCheckoutProfile(userId: string, claims: { email?: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin.from("profiles").select("full_name, cpf_cnpj").eq("id", userId).maybeSingle();
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
  const email = claims.email ?? authUser.user?.email;
  if (!email) throw new Error("E-mail do usuário não encontrado para gerar cobrança.");
  return {
    email,
    name: profile?.full_name || email.split("@")[0] || "Aluno FCIA",
    cpfCnpj: (profile?.cpf_cnpj ?? null) as string | null,
  };
}

async function findReusablePendingPayment(userId: string, planId: string, courseId: string | null): Promise<PixChargeResult | null> {
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
    planId: data.plan_id,
    courseId: data.course_id,
    pixQrCode: data.pix_qr_code,
    pixCopyPaste: data.pix_copy_paste,
    invoiceUrl: data.invoice_url,
    dueDate: data.due_date,
  };
}

async function asaasFetch<T>(path: string, apiKey: string, init: RequestInit): Promise<T> {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("access_token", apiKey);
  // Asaas exige User-Agent. Cloudflare Workers permite sobrescrever, mas apenas
  // quando definido via Headers object (literais podem ser descartados).
  headers.set("User-Agent", "FCIA-Academy/1.0 (+https://fciaacademy.lovable.app)");
  if (init.headers) {
    new Headers(init.headers as HeadersInit).forEach((v, k) => headers.set(k, v));
  }
  const response = await fetch(`https://api.asaas.com/v3${path}`, { ...init, headers });
  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;
  if (!response.ok) {
    console.error("Asaas request failed", { status: response.status, path, body, sentUA: headers.get("User-Agent") });
    const detail = (body as { errors?: Array<{ description?: string }> } | null)?.errors?.[0]?.description;
    throw new Error(detail ? `Asaas: ${detail}` : "Falha ao criar cobrança PIX no Asaas.");
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

function isPaidStatus(status: PaymentStatus): boolean {
  return status === "received" || status === "confirmed";
}
