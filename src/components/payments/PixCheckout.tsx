import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Copy, ExternalLink, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createPixCharge } from "@/lib/payments.functions";
import {
  isPaymentApproved,
  isPaymentTerminal,
  PAID_PLAN_LABEL,
  paymentQuery,
  type PaidPlanId,
} from "@/lib/payments";

export type PixCheckoutProps =
  | { mode?: "plan"; planId: PaidPlanId; courseId?: string; title?: string; onPaid?: () => void }
  | { mode: "course"; courseId: string; title: string; onPaid?: () => void; planId?: never };

export function PixCheckout(props: PixCheckoutProps) {
  const queryClient = useQueryClient();
  const createCharge = useServerFn(createPixCharge);
  const [paymentId, setPaymentId] = useState<string>();
  const payment = useQuery({
    ...paymentQuery(paymentId),
    refetchInterval: (query) => (isPaymentTerminal(query.state.data?.status) ? false : 4_000),
  });

  const isCourseMode = props.mode === "course";
  const headline = isCourseMode
    ? props.title
    : `Plano ${PAID_PLAN_LABEL[(props as { planId: PaidPlanId }).planId]}`;

  const charge = useMutation({
    mutationFn: () =>
      createCharge({
        data: isCourseMode
          ? { mode: "course", courseId: props.courseId }
          : { mode: "plan", planId: (props as { planId: PaidPlanId }).planId, courseId: props.courseId },
      }),
    onSuccess: (result) => {
      setPaymentId(result.paymentId);
      toast.success("PIX gerado", { description: "Pague pelo app do seu banco para liberar o acesso." });
    },
    onError: (error: Error) => toast.error("Não foi possível gerar o PIX", { description: error.message }),
  });

  const currentPayment = payment.data;
  const copyPasteCode = currentPayment?.pix_copy_paste ?? charge.data?.pixCopyPaste ?? "";
  const qrImage = currentPayment?.pix_qr_code ?? charge.data?.pixQrCode ?? null;
  const invoiceUrl = currentPayment?.invoice_url ?? charge.data?.invoiceUrl ?? null;
  const approved = isPaymentApproved(currentPayment?.status ?? charge.data?.status);
  const amount = currentPayment?.amount ?? charge.data?.amount;

  useEffect(() => {
    if (!approved) return;
    queryClient.invalidateQueries({ queryKey: ["current-plan"] });
    queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    onPaidCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved]);

  function onPaidCall() {
    props.onPaid?.();
  }

  async function copyCode() {
    if (!copyPasteCode) return;
    await navigator.clipboard.writeText(copyPasteCode);
    toast.success("Código PIX copiado");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            <QrCode className="h-3.5 w-3.5" /> {isCourseMode ? "Compra do curso via PIX" : "Checkout PIX"}
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold">{headline}</h2>
          {amount != null && <p className="mt-1 text-sm text-muted-foreground">Valor: R$ {amount.toFixed(2).replace(".", ",")}</p>}
        </div>
        {approved && <CheckCircle2 className="h-6 w-6 text-primary" />}
      </div>

      {!charge.data && !currentPayment ? (
        <Button className="mt-5 w-full" disabled={charge.isPending} onClick={() => charge.mutate()}>
          {charge.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
          Gerar QR Code PIX
        </Button>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-2xl border border-border bg-foreground p-3">
            {qrImage ? (
              <img src={`data:image/png;base64,${qrImage}`} alt="QR Code PIX para pagamento" className="h-full w-full" />
            ) : copyPasteCode ? (
              <QRCodeSVG value={copyPasteCode} size={196} level="M" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-background" />
            )}
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">PIX copia e cola</p>
            <p className="mt-2 break-all font-mono text-xs text-foreground/80">{copyPasteCode || "Gerando código..."}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="flex-1" disabled={!copyPasteCode} onClick={copyCode}>
              <Copy className="mr-2 h-4 w-4" /> Copiar código
            </Button>
            {invoiceUrl && (
              <Button asChild variant="outline" className="flex-1">
                <a href={invoiceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Abrir cobrança
                </a>
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {approved ? "Pagamento confirmado. Acesso liberado." : "Aguardando confirmação automática do Asaas."}
          </p>
        </div>
      )}
    </div>
  );
}