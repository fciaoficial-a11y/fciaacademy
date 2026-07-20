import { timingSafeEqual } from "crypto";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ASAAS_API_BASE = "https://api.asaas.com/v3";

const paymentSchema = z.object({
  id: z.string().min(1),
  status: z.string().optional(),
  value: z.number().optional(),
  billingType: z.string().optional(),
  dueDate: z.string().optional(),
  invoiceUrl: z.string().optional(),
  paymentDate: z.string().optional().nullable(),
  confirmedDate: z.string().optional().nullable(),
});

const webhookSchema = z.object({
  id: z.string().optional(), // Asaas event id (evt_...)
  event: z.string().min(1),
  payment: paymentSchema,
});

const PAID_STATUSES = new Set(["received", "confirmed"]);

export const Route = createFileRoute("/api/public/webhooks/asaas")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204 }),
      POST: async ({ request }) => {
        const t0 = Date.now();
        const rid = crypto.randomUUID();
        try {
          const rawBody = await request.text();
          const payload = webhookSchema.parse(JSON.parse(rawBody));
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
          const receivedToken = request.headers.get("asaas-access-token") ?? "";
          const tokenIsValid = expectedToken ? safeEqual(receivedToken, expectedToken) : false;

          console.info("[asaas-webhook]", JSON.stringify({
            rid, event: payload.event, payment_id: payload.payment.id,
            status: payload.payment.status, token_valid: tokenIsValid,
          }));

          let trustedPayload = payload;
          if (!tokenIsValid) {
            const apiKey = process.env.ASAAS_API_KEY;
            if (!apiKey) {
              console.warn("[asaas-webhook]", JSON.stringify({ rid, reason: "unauthorized_no_apikey" }));
              return new Response("Unauthorized", { status: 401 });
            }
            const verifiedPayment = await asaasFetch<z.infer<typeof paymentSchema>>(`/payments/${payload.payment.id}`, apiKey);
            trustedPayload = {
              ...payload,
              payment: {
                ...payload.payment,
                id: verifiedPayment.id,
                status: verifiedPayment.status,
                value: verifiedPayment.value,
                billingType: verifiedPayment.billingType,
                dueDate: verifiedPayment.dueDate,
                invoiceUrl: verifiedPayment.invoiceUrl,
                paymentDate: verifiedPayment.paymentDate,
                confirmedDate: verifiedPayment.confirmedDate,
              },
            };
          }

          const result = await processPaymentPayload(supabaseAdmin, trustedPayload);
          console.info("[asaas-webhook]", JSON.stringify({
            rid, ms: Date.now() - t0, result,
          }));
          return Response.json({ ...result, recoveredFromTokenMismatch: !tokenIsValid });
        } catch (err) {
          console.error("[asaas-webhook]", JSON.stringify({
            rid, ok: false, ms: Date.now() - t0,
            error: err instanceof Error ? err.message : String(err),
          }));
          throw err;
        }
      },
    },
  },
});

function safeEqual(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

async function processPaymentPayload(
  supabaseAdmin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"],
  payload: z.infer<typeof webhookSchema>,
) {
  const eventId = payload.id ?? `${payload.event}:${payload.payment.id}:${payload.payment.status ?? ""}`;

  const { error: insertEventError } = await supabaseAdmin.from("gateway_events").insert({
    provider: "asaas",
    event_id: eventId,
    event_type: payload.event,
    payment_id: payload.payment.id,
  });

  if (insertEventError) {
    // 23505 = unique_violation → already processed, ACK to stop retries.
    if ((insertEventError as { code?: string }).code === "23505") {
      return { ok: true, duplicate: true };
    }
    throw insertEventError;
  }

  const newStatus = normalizeAsaasStatus(payload.event, payload.payment.status);
  const paidAt = getPaidAt(newStatus, payload.payment.paymentDate, payload.payment.confirmedDate);

  const { data: existing, error: readError } = await supabaseAdmin
    .from("payments")
    .select("id, user_id, plan_id, course_id, status")
    .eq("provider", "asaas")
    .eq("provider_payment_id", payload.payment.id)
    .maybeSingle();

  if (readError) throw readError;
  if (!existing) return { ok: true, ignored: true };

  const wasPaid = PAID_STATUSES.has(existing.status ?? "");
  const isPaid = PAID_STATUSES.has(newStatus);

  const { error: updateError } = await supabaseAdmin
    .from("payments")
    .update({
      status: newStatus,
      amount: payload.payment.value,
      billing_type: payload.payment.billingType ?? "PIX",
      invoice_url: payload.payment.invoiceUrl ?? undefined,
      due_date: payload.payment.dueDate,
      paid_at: paidAt ?? undefined,
      raw_payload: payload,
    })
    .eq("id", existing.id);
  if (updateError) throw updateError;

  // PAYMENT_CONFIRMED + PAYMENT_RECEIVED para a mesma cobrança não liberam em duplicidade,
  // porque depois do primeiro evento pago `wasPaid` passa a ser true.
  if (isPaid && !wasPaid) {
    const { error: grantError } = await supabaseAdmin.rpc("grant_paid_access", {
      _user_id: existing.user_id,
      _plan_id: existing.plan_id,
      _course_id: existing.course_id ?? undefined,
    });
    if (grantError) throw grantError;
  }

  return { ok: true, granted: isPaid && !wasPaid, status: newStatus };
}

function normalizeAsaasStatus(event: string, status: string | undefined) {
  const source = `${event} ${status ?? ""}`.toUpperCase();
  if (source.includes("CONFIRMED")) return "confirmed";
  if (source.includes("RECEIVED")) return "received";
  if (source.includes("OVERDUE")) return "overdue";
  if (source.includes("REFUND")) return "refunded";
  if (source.includes("CHARGEBACK")) return "chargeback";
  if (source.includes("DELETED") || source.includes("CANCEL")) return "cancelled";
  return "pending";
}

function getPaidAt(status: string, paymentDate?: string | null, confirmedDate?: string | null) {
  if (status !== "received" && status !== "confirmed") return null;
  return paymentDate ?? confirmedDate ?? new Date().toISOString();
}

async function asaasFetch<T>(path: string, apiKey: string): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("access_token", apiKey);
  headers.set("User-Agent", "FCIA-Academy/1.0 (+https://fciaacademy.lovable.app)");

  const response = await fetch(`${ASAAS_API_BASE}${path}`, { method: "GET", headers });
  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;
  if (!response.ok) throw new Error("Não foi possível validar a cobrança no Asaas.");
  return body as T;
}