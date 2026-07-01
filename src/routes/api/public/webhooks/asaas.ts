import { timingSafeEqual } from "crypto";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

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
        const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
        if (!expectedToken) return new Response("Webhook token not configured", { status: 500 });

        const receivedToken = request.headers.get("asaas-access-token") ?? "";
        if (!safeEqual(receivedToken, expectedToken)) return new Response("Unauthorized", { status: 401 });

        const rawBody = await request.text();
        const payload = webhookSchema.parse(JSON.parse(rawBody));
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 1) Event-level dedupe using Asaas event id when present.
        //    Fallback: synthesize from event type + payment id + status so a payload
        //    without `id` still gets deduped on retries.
        const eventId =
          payload.id ??
          `${payload.event}:${payload.payment.id}:${payload.payment.status ?? ""}`;

        const { error: insertEventError } = await supabaseAdmin
          .from("gateway_events")
          .insert({
            provider: "asaas",
            event_id: eventId,
            event_type: payload.event,
            payment_id: payload.payment.id,
          });

        if (insertEventError) {
          // 23505 = unique_violation → already processed, ACK to stop retries.
          if ((insertEventError as { code?: string }).code === "23505") {
            return Response.json({ ok: true, duplicate: true });
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
        if (!existing) return Response.json({ ok: true, ignored: true });

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

        // 2) Only grant on real transition to paid.
        //    PAYMENT_CONFIRMED + PAYMENT_RECEIVED for the same charge no longer double-grant,
        //    because after the first one `wasPaid` becomes true.
        if (isPaid && !wasPaid) {
          const { error: grantError } = await supabaseAdmin.rpc("grant_paid_access", {
            _user_id: existing.user_id,
            _plan_id: existing.plan_id,
            _course_id: existing.course_id ?? undefined,
          });
          if (grantError) throw grantError;
        }

        return Response.json({ ok: true, granted: isPaid && !wasPaid });
      },
    },
  },
});

function safeEqual(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
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
