import type { ComponentType } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type PdfLib = {
  Document: ComponentType<any>;
  Page: ComponentType<any>;
  version: string;
};

let cached: PdfLib | null = null;

export function loadPdfLib(): PdfLib {
  if (!cached) {
    cached = {
      Document: Document as unknown as ComponentType<any>,
      Page: Page as unknown as ComponentType<any>,
      version: pdfjs.version,
    };
  }
  return cached;
}
