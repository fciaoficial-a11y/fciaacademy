import { useCallback, useRef, useState } from "react";
import { Film, Image as ImageIcon, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BUCKET = "course-videos";
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_POSTER_BYTES = 5 * 1024 * 1024; // 5 MB
const VIDEO_MIME = "video/mp4";
const POSTER_MIMES = ["image/jpeg", "image/png", "image/webp"];

export type IntroVideoMeta = {
  intro_video_path: string | null;
  intro_video_duration_seconds: number | null;
  intro_video_poster_path: string | null;
};

type Props = {
  courseId?: string | null;
  moduleId?: string | null;
  value?: Partial<IntroVideoMeta> | null;
  onChange: (meta: IntroVideoMeta) => void;
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
  contentType: string,
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
    xhr.setRequestHeader("Content-Type", contentType);
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

async function probeVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const d = Number.isFinite(v.duration) ? Math.round(v.duration) : null;
        URL.revokeObjectURL(url);
        resolve(d);
      };
      v.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      v.src = url;
    } catch {
      resolve(null);
    }
  });
}

export function VideoUploader({ courseId, moduleId, value, onChange, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [posterUploading, setPosterUploading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const disabledPath = !courseId || !moduleId;

  const validateVideo = (file: File): string | null => {
    if (file.type !== VIDEO_MIME && !file.name.toLowerCase().endsWith(".mp4")) {
      return "Apenas MP4 é aceito nesta versão.";
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return `Vídeo excede ${fmtBytes(MAX_VIDEO_BYTES)}.`;
    }
    if (file.size === 0) return "Arquivo vazio.";
    return null;
  };

  const validatePoster = (file: File): string | null => {
    if (!POSTER_MIMES.includes(file.type)) return "Poster deve ser JPG, PNG ou WEBP.";
    if (file.size > MAX_POSTER_BYTES) return `Poster excede ${fmtBytes(MAX_POSTER_BYTES)}.`;
    return null;
  };

  const startUpload = useCallback(
    async (file: File) => {
      if (disabledPath) {
        toast.error("Salve o módulo antes de enviar o vídeo (curso e módulo obrigatórios).");
        return;
      }
      const err = validateVideo(file);
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
      const path = `courses/${courseId}/modules/${moduleId}/intro.mp4`;
      abortRef.current = new AbortController();
      try {
        const [_, duration] = await Promise.all([
          uploadWithProgress(path, file, VIDEO_MIME, setProgress, abortRef.current.signal),
          probeVideoDuration(file),
        ]);
        void _;
        onChange({
          intro_video_path: path,
          intro_video_duration_seconds: duration,
          intro_video_poster_path: value?.intro_video_poster_path ?? null,
        });
        setState("idle");
        setPendingName(null);
        toast.success("Vídeo enviado.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha no upload";
        setState("error");
        setErrorMsg(msg);
        toast.error(msg);
      }
    },
    [courseId, moduleId, disabledPath, onChange, value?.intro_video_poster_path]
  );

  const cancel = () => {
    abortRef.current?.abort();
    setState("idle");
    setPendingName(null);
    setProgress(0);
  };

  const remove = async () => {
    if (!value?.intro_video_path) return;
    await supabase.storage.from(BUCKET).remove([value.intro_video_path]).catch(() => {});
    onChange({
      intro_video_path: null,
      intro_video_duration_seconds: null,
      intro_video_poster_path: value.intro_video_poster_path ?? null,
    });
  };

  const startPosterUpload = async (file: File) => {
    if (disabledPath) return;
    const err = validatePoster(file);
    if (err) {
      toast.error(err);
      return;
    }
    setPosterUploading(true);
    const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
    const path = `courses/${courseId}/modules/${moduleId}/poster.${ext}`;
    try {
      await uploadWithProgress(path, file, file.type, () => {});
      onChange({
        intro_video_path: value?.intro_video_path ?? null,
        intro_video_duration_seconds: value?.intro_video_duration_seconds ?? null,
        intro_video_poster_path: path,
      });
      toast.success("Poster enviado.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha no upload do poster";
      toast.error(msg);
    } finally {
      setPosterUploading(false);
    }
  };

  const removePoster = async () => {
    if (!value?.intro_video_poster_path) return;
    await supabase.storage.from(BUCKET).remove([value.intro_video_poster_path]).catch(() => {});
    onChange({
      intro_video_path: value.intro_video_path ?? null,
      intro_video_duration_seconds: value.intro_video_duration_seconds ?? null,
      intro_video_poster_path: null,
    });
  };

  const hasVideo = Boolean(value?.intro_video_path);
  const hasPoster = Boolean(value?.intro_video_poster_path);

  return (
    <div className="space-y-3">
      {disabledPath && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-500">
          Salve o módulo primeiro (curso + título) para habilitar o upload de vídeo.
        </p>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !disabledPath && state !== "uploading") setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || disabledPath || state === "uploading") return;
          const f = e.dataTransfer.files?.[0];
          if (f) startUpload(f);
        }}
        onClick={() => {
          if (disabled || disabledPath || state === "uploading") return;
          inputRef.current?.click();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-background/40 p-6 text-center transition-colors",
          dragOver && "border-primary bg-primary/5",
          (disabled || disabledPath || state === "uploading") && "cursor-not-allowed opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,.mp4"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && startUpload(e.target.files[0])}
        />
        {state === "uploading" ? (
          <>
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Enviando {pendingName}…</p>
            <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
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
            <p className="text-sm font-medium">Arraste um MP4 aqui ou clique para escolher</p>
            <p className="mt-1 text-xs text-muted-foreground">
              MP4 · até {fmtBytes(MAX_VIDEO_BYTES)} · 20–45s recomendados · 16:9
            </p>
          </>
        )}
      </div>

      {state === "error" && errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

      {hasVideo && state !== "uploading" && (
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Film className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Vídeo de abertura anexado</p>
              <p className="text-xs text-muted-foreground">
                {value?.intro_video_duration_seconds
                  ? `${value.intro_video_duration_seconds}s`
                  : "duração desconhecida"}{" "}
                · armazenado com segurança
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={remove} title="Remover vídeo">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}

      {hasVideo && (
        <div className="rounded-lg border border-border/60 bg-card/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Poster (opcional)</span>
            {hasPoster && (
              <Button type="button" variant="ghost" size="sm" onClick={removePoster}>
                <Trash2 className="mr-1 h-3.5 w-3.5 text-destructive" /> Remover
              </Button>
            )}
          </div>
          <input
            ref={posterInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && startPosterUpload(e.target.files[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => posterInputRef.current?.click()}
            disabled={posterUploading || disabledPath}
          >
            {posterUploading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageIcon className="mr-2 h-3.5 w-3.5" />
            )}
            {hasPoster ? "Substituir poster" : "Enviar poster"}
          </Button>
          <p className="mt-1 text-[11px] text-muted-foreground">
            JPG/PNG/WEBP · até {fmtBytes(MAX_POSTER_BYTES)}
          </p>
        </div>
      )}
    </div>
  );
}
