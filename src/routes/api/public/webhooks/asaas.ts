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
  event: z.string().min(1),
  payment: paymentSchema,
});

export const Route = createFileRoute("/api/public/webhooks/asaas")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204 }),
      POST: async ({ request }) => {
        const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
        if (!expectedToken) return new Response("Webhook token not configured", { status: 500 });

        const receivedToken = request.headers.get("asaas-access-token") ?? "";
        if (!safeEqual(receivedToken, expectedToken)) return new Response("Unauthorized", { status: 401 });

        const payload = webhookSchema.parse(await request.json());
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const status = normalizeAsaasStatus(payload.event, payload.payment.status);
        const paidAt = getPaidAt(status, payload.payment.paymentDate, payload.payment.confirmedDate);

        const { data: existing, error: readError } = await supabaseAdmin
          .from("payments")
          .select("id, user_id, plan_id, course_id")
          .eq("provider", "asaas")
          .eq("provider_payment_id", payload.payment.id)
          .maybeSingle();

        if (readError) throw readError;
        if (!existing) return Response.json({ ok: true, ignored: true });

        const { error: updateError } = await supabaseAdmin
          .from("payments")
          .update({
            status,
            amount: payload.payment.value,
            billing_type: payload.payment.billingType ?? "PIX",
            invoice_url: payload.payment.invoiceUrl ?? undefined,
            due_date: payload.payment.dueDate,
            paid_at: paidAt,
            raw_payload: payload,
          })
          .eq("id", existing.id);
        if (updateError) throw updateError;

        if (status === "received" || status === "confirmed") {
          const { error: grantError } = await supabaseAdmin.rpc("grant_paid_access", {
            _user_id: existing.user_id,
            _plan_id: existing.plan_id,
            _course_id: existing.course_id,
          });
          if (grantError) throw grantError;
        }

        return Response.json({ ok: true });
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