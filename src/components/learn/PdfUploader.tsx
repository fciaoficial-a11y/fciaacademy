import { useCallback, useRef, useState } from "react";
import { FileText, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BUCKET = "course-assets";
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_MIME = "application/pdf";

export type PdfMeta = {
  pdf_path: string;
  pdf_file_name: string;
  pdf_file_size: number;
  pdf_mime_type: string;
};

type Props = {
  value?: {
    pdf_path?: string | null;
    pdf_file_name?: string | null;
    pdf_file_size?: number | null;
  } | null;
  onChange: (meta: PdfMeta | null) => void;
  disabled?: boolean;
};

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function uploadWithProgress(
  path: string,
  file: File,
  onProgress: (pct: number) => void,
  signal?: AbortSignal
): Promise<void> {
  const supaUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Sessão inválida. Faça login novamente.");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${supaUrl}/storage/v1/object/${BUCKET}/${path}`;
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", file.type || ACCEPTED_MIME);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("cache-control", "3600");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Falha no upload (${xhr.status}): ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error("Erro de rede no upload"));
    xhr.onabort = () => reject(new Error("Upload cancelado"));
    signal?.addEventListener("abort", () => xhr.abort());

    xhr.send(file);
  });
}

export function PdfUploader({ value, onChange, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (file.type !== ACCEPTED_MIME && !file.name.toLowerCase().endsWith(".pdf")) {
      return "Apenas arquivos PDF são aceitos.";
    }
    if (file.size > MAX_BYTES) {
      return `Arquivo excede o limite de ${fmtBytes(MAX_BYTES)}.`;
    }
    if (file.size === 0) return "Arquivo vazio.";
    return null;
  };

  const startUpload = useCallback(
    async (file: File) => {
      const err = validate(file);
      if (err) {
        setState("error");
        setErrorMsg(err);
        toast.error(err);
        return;
      }
      setState("uploading");
      setErrorMsg(null);
      setProgress(0);
      setPendingName(file.name);
      const path = `pdfs/${crypto.randomUUID()}.pdf`;
      abortRef.current = new AbortController();
      try {
        await uploadWithProgress(path, file, setProgress, abortRef.current.signal);
        onChange({
          pdf_path: path,
          pdf_file_name: file.name,
          pdf_file_size: file.size,
          pdf_mime_type: ACCEPTED_MIME,
        });
        setState("idle");
        setPendingName(null);
        toast.success("PDF enviado.");
      } catch (e: any) {
        setState("error");
        setErrorMsg(e.message);
        toast.error(e.message);
      }
    },
    [onChange]
  );

  const cancel = () => {
    abortRef.current?.abort();
    setState("idle");
    setPendingName(null);
    setProgress(0);
  };

  const remove = async () => {
    if (!value?.pdf_path) return;
    // Best-effort delete; row update happens through the parent onChange.
    await supabase.storage.from(BUCKET).remove([value.pdf_path]).catch(() => {});
    onChange(null);
  };

  const hasFile = Boolean(value?.pdf_path);

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && state !== "uploading") setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || state === "uploading") return;
          const f = e.dataTransfer.files?.[0];
          if (f) startUpload(f);
        }}
        onClick={() => {
          if (disabled || state === "uploading") return;
          inputRef.current?.click();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-background/40 p-6 text-center transition-colors",
          dragOver && "border-primary bg-primary/5",
          (disabled || state === "uploading") && "cursor-not-allowed opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && startUpload(e.target.files[0])}
        />
        {state === "uploading" ? (
          <>
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Enviando {pendingName}…</p>
            <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{progress}%</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                cancel();
              }}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Cancelar
            </Button>
          </>
        ) : (
          <>
            <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Arraste um PDF aqui ou clique para escolher
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Somente .pdf · até {fmtBytes(MAX_BYTES)}
            </p>
          </>
        )}
      </div>

      {state === "error" && errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}

      {hasFile && state !== "uploading" && (
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {value?.pdf_file_name || "PDF anexado"}
              </p>
              <p className="text-xs text-muted-foreground">
                {value?.pdf_file_size ? fmtBytes(value.pdf_file_size) : ""} · armazenado com segurança
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={remove}
            title="Remover PDF"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
