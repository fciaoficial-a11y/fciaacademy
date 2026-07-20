import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Configure the pdf.js worker to match the exact API version bundled by react-pdf.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


type Props = {
  signedUrl: string;
  fileName?: string | null;
  studentLabel: string;
  allowDownload?: boolean;
  completed?: boolean;
  onProgress?: (visitedPct: number) => void;
  onComplete?: () => void;
  onReload?: () => void;
};

export function PdfViewer({
  signedUrl,
  fileName,
  studentLabel,
  allowDownload = false,
  completed = false,
  onProgress,
  onComplete,
  onReload,
}: Props) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(720);
  const autoCompletedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setContainerWidth(Math.max(320, el.clientWidth - 16));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(pageNumber)) return prev;
      const next = new Set(prev);
      next.add(pageNumber);
      return next;
    });
  }, [pageNumber]);

  useEffect(() => {
    if (!numPages) return;
    const pct = Math.round((visited.size / numPages) * 100);
    onProgress?.(pct);
    if (
      !autoCompletedRef.current &&
      !completed &&
      pageNumber === numPages &&
      visited.size / numPages >= 0.9
    ) {
      autoCompletedRef.current = true;
      onComplete?.();
    }
  }, [visited, numPages, pageNumber, completed, onComplete, onProgress]);

  const goPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goNext = () => setPageNumber((p) => Math.min(numPages || 1, p + 1));

  const watermark = useMemo(
    () => `${studentLabel} · ${new Date().toLocaleDateString("pt-BR")}`,
    [studentLabel]
  );

  const pdfOptions = useMemo(
    () => ({ cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`, cMapPacked: true }),
    []
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            disabled={pageNumber <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[70px] text-center text-xs tabular-nums text-muted-foreground">
            {pageNumber} / {numPages || "—"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            disabled={!numPages || pageNumber >= numPages}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.15))}
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[48px] text-center text-xs text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {onReload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onReload}
              aria-label="Recarregar"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {allowDownload && (
            <Button asChild variant="ghost" size="icon" aria-label="Baixar PDF">
              <a href={signedUrl} download={fileName || "material.pdf"}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Viewer with watermark overlay */}
      <div
        ref={containerRef}
        className="relative max-h-[75vh] overflow-auto bg-neutral-900/40 p-2"
      >
        {loadError ? (
          <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <p className="text-sm text-destructive">{loadError}</p>
            {onReload && (
              <Button size="sm" variant="outline" onClick={onReload}>
                Tentar novamente
              </Button>
            )}
          </div>
        ) : (
          <Document
            file={signedUrl}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              setLoadError(null);
            }}
            onLoadError={(e) =>
              setLoadError(e?.message || "Falha ao carregar o PDF")
            }
            loading={
              <div className="flex items-center justify-center p-10 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando material…
              </div>
            }
            options={pdfOptions}
          >
            <div className="relative mx-auto w-fit">
              <Page
                pageNumber={pageNumber}
                width={containerWidth}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
              {/* Watermark overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-24 overflow-hidden select-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="whitespace-nowrap text-xs font-medium text-primary/25 rotate-[-30deg]"
                  >
                    {watermark}
                  </span>
                ))}
              </div>
            </div>
          </Document>
        )}
      </div>

      {/* Footer / progress */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3 py-2 text-xs">
        <span className="text-muted-foreground">
          {numPages
            ? `Leitura: ${Math.round((visited.size / numPages) * 100)}%`
            : "—"}
        </span>
        {completed ? (
          <span className="inline-flex items-center gap-1 text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" /> Concluído
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={onComplete}>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Marcar como lido
          </Button>
        )}
      </div>
    </div>
  );
}
