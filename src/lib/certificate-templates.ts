/**
 * Certificate template registry — premium tech edition.
 *
 * Three highly-differentiated visual directions, all sharing the same dynamic
 * field contract so switching templates is purely a rendering swap.
 *
 * Directions:
 *  1. executive_tech      — ivory + navy + electric cyan, left-rail editorial
 *  2. dark_premium_tech   — midnight + cyan/violet glow, holographic tech
 *  3. editorial_prestige  — bone + charcoal + rose gold, museum-grade layout
 */
import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";

export type TemplateKey =
  | "executive_tech"
  | "dark_premium_tech"
  | "editorial_prestige";

export interface TemplateOption {
  key: TemplateKey;
  name: string;
  tagline: string;
  description: string;
  vibe: "light" | "dark" | "ivory";
  accent: string; // hex used in admin UI accents
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    key: "executive_tech",
    name: "Executive Tech",
    tagline: "Editorial · Cyan · Precisão",
    description:
      "Barra vertical institucional, tipografia serifada moderna e coluna monoespaçada de metadados. Sofisticação executiva com linguagem de produto tech.",
    vibe: "light",
    accent: "#0ea5e9",
  },
  {
    key: "dark_premium_tech",
    name: "Dark Premium Tech",
    tagline: "Credencial digital · Editorial · Neon quieto",
    description:
      "Midnight profundo com um único halo cyan fora do eixo, tipografia serifada para o nome e módulo de credencial integrado. Assinatura visual autoral, sem molduras, com respiro de produto digital premium.",
    vibe: "dark",
    accent: "#22d3ee",
  },
  {
    key: "editorial_prestige",
    name: "Editorial Prestige",
    tagline: "Museu · Dourado rosé · Silêncio",
    description:
      "Papel bone, moldura dupla e ornamentos discretos em rosé. Composição centrada com respiro cirúrgico — sensação de edição limitada.",
    vibe: "ivory",
    accent: "#b08050",
  },
];

export interface RenderContext {
  studentName: string;
  courseTitle: string;
  workloadHours: number;
  completionDate: string;
  issuedDate: string;
  validationCode: string;
  verificationUrl: string;
  institutionName: string;
  trackTitle: string;
  certificateTitle: string;
  bodyText: string;
  legalFooter: string;
  issuerName: string;
  issuerRole: string;
  qrPng: Uint8Array;
}

// ---------- shared helpers ----------

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: { r: number; g: number; b: number },
  opts: { characterSpacing?: number } = {}
) {
  const { width } = page.getSize();
  const w =
    font.widthOfTextAtSize(text, size) +
    (opts.characterSpacing ?? 0) * Math.max(0, text.length - 1);
  page.drawText(text, {
    x: (width - w) / 2,
    y,
    size,
    font,
    color: rgb(color.r, color.g, color.b),
  });
}

function fitName(
  name: string,
  font: PDFFont,
  startSize: number,
  maxWidth: number,
  minSize = 20
) {
  let size = startSize;
  while (font.widthOfTextAtSize(name, size) > maxWidth && size > minSize) {
    size -= 1;
  }
  return size;
}

// pdf-lib rgb, lazily loaded to keep bundle graph clean
let _rgb: typeof import("pdf-lib").rgb;
function rgb(r: number, g: number, b: number) {
  return _rgb(r, g, b);
}

async function loadPdfLib() {
  const lib = await import("pdf-lib");
  _rgb = lib.rgb;
  return lib;
}

// ---------- Template 1 — Executive Tech ----------
/**
 * Landscape ivory sheet. Vertical navy rail on the left carrying institution
 * name rotated 90°. Serif student name huge on the right, thin cyan hairline,
 * monospaced meta grid, minimal signature and QR module bottom aligned.
 */
async function renderExecutiveTech(ctx: RenderContext): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, degrees } = await loadPdfLib();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const times = await pdf.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const monoBold = await pdf.embedFont(StandardFonts.CourierBold);

  // Palette
  const paper = { r: 0.976, g: 0.973, b: 0.965 };
  const paperEdge = { r: 0.94, g: 0.94, b: 0.93 };
  const navy = { r: 0.043, g: 0.086, b: 0.196 };
  const ink = { r: 0.09, g: 0.11, b: 0.16 };
  const cyan = { r: 0.055, g: 0.647, b: 0.914 };
  const mute = { r: 0.42, g: 0.46, b: 0.55 };

  // Paper background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(paper.r, paper.g, paper.b),
  });
  // Subtle top-right paper shade
  page.drawRectangle({
    x: width - 220,
    y: height - 220,
    width: 220,
    height: 220,
    color: rgb(paperEdge.r, paperEdge.g, paperEdge.b),
    opacity: 0.5,
  });

  // Left vertical rail (navy)
  const railW = 78;
  page.drawRectangle({
    x: 0,
    y: 0,
    width: railW,
    height,
    color: rgb(navy.r, navy.g, navy.b),
  });
  // Cyan hairline on rail edge
  page.drawRectangle({
    x: railW,
    y: 0,
    width: 2,
    height,
    color: rgb(cyan.r, cyan.g, cyan.b),
  });
  // Vertical institution name on rail
  const railLabel = ctx.institutionName.toUpperCase();
  page.drawText(railLabel, {
    x: 30,
    y: 60,
    size: 10,
    font: helvBold,
    color: rgb(1, 1, 1),
    rotate: degrees(90),
  });
  page.drawText("CERTIFICATE · DIGITAL CREDENTIAL", {
    x: 46,
    y: 60,
    size: 6,
    font: mono,
    color: rgb(0.7, 0.78, 0.95),
    rotate: degrees(90),
  });

  // Content area
  const cx = railW + 44;
  const rightPad = 44;
  const contentW = width - cx - rightPad;

  // Top meta row
  const topY = height - 60;
  page.drawText("N°", {
    x: cx,
    y: topY,
    size: 7,
    font: monoBold,
    color: rgb(mute.r, mute.g, mute.b),
  });
  page.drawText(ctx.validationCode, {
    x: cx + 18,
    y: topY,
    size: 9,
    font: monoBold,
    color: rgb(navy.r, navy.g, navy.b),
  });
  const trackTxt = ctx.trackTitle
    ? `TRACK · ${ctx.trackTitle.toUpperCase()}`
    : "PROFESSIONAL PROGRAM";
  const trackW = helvBold.widthOfTextAtSize(trackTxt, 8);
  page.drawText(trackTxt, {
    x: cx + contentW - trackW,
    y: topY,
    size: 8,
    font: helvBold,
    color: rgb(mute.r, mute.g, mute.b),
  });

  // Cyan tick
  page.drawRectangle({
    x: cx,
    y: topY - 14,
    width: 32,
    height: 2,
    color: rgb(cyan.r, cyan.g, cyan.b),
  });

  // Eyebrow
  let cy = topY - 46;
  page.drawText("CERTIFICADO", {
    x: cx,
    y: cy,
    size: 9,
    font: helvBold,
    color: rgb(cyan.r, cyan.g, cyan.b),
  });
  cy -= 14;
  page.drawText(ctx.certificateTitle.toUpperCase(), {
    x: cx,
    y: cy,
    size: 11,
    font: helv,
    color: rgb(mute.r, mute.g, mute.b),
  });

  // Student name — serif, huge, auto-fit
  cy -= 62;
  const nameSize = fitName(ctx.studentName, timesBold, 46, contentW, 26);
  page.drawText(ctx.studentName, {
    x: cx,
    y: cy,
    size: nameSize,
    font: timesBold,
    color: rgb(navy.r, navy.g, navy.b),
  });
  // underline accent
  page.drawRectangle({
    x: cx,
    y: cy - 8,
    width: 90,
    height: 2,
    color: rgb(cyan.r, cyan.g, cyan.b),
  });

  // Body
  cy -= 36;
  const bodyLines = wrapText(ctx.bodyText, helv, 11, contentW - 40);
  for (const line of bodyLines.slice(0, 4)) {
    page.drawText(line, {
      x: cx,
      y: cy,
      size: 11,
      font: helv,
      color: rgb(ink.r, ink.g, ink.b),
    });
    cy -= 15;
  }

  // Monospace meta grid
  const metaY = 168;
  const chips: Array<[string, string]> = [
    ["CARGA", `${ctx.workloadHours}H`],
    ["CONCLUSÃO", ctx.completionDate.toUpperCase()],
    ["EMISSÃO", ctx.issuedDate.toUpperCase()],
    ["VERIFICAÇÃO", "FCIA.ID"],
  ];
  const colW = contentW / 4;
  chips.forEach(([label, value], i) => {
    const x = cx + i * colW;
    // top hairline
    page.drawRectangle({
      x,
      y: metaY + 34,
      width: colW - 14,
      height: 0.6,
      color: rgb(navy.r, navy.g, navy.b),
      opacity: 0.35,
    });
    page.drawText(label, {
      x,
      y: metaY + 20,
      size: 7,
      font: monoBold,
      color: rgb(mute.r, mute.g, mute.b),
    });
    page.drawText(value, {
      x,
      y: metaY,
      size: 11,
      font: monoBold,
      color: rgb(navy.r, navy.g, navy.b),
    });
  });

  // Signature (bottom-left within content)
  const sigX = cx;
  const sigY = 74;
  page.drawLine({
    start: { x: sigX, y: sigY + 32 },
    end: { x: sigX + 220, y: sigY + 32 },
    thickness: 0.8,
    color: rgb(navy.r, navy.g, navy.b),
  });
  page.drawText(ctx.issuerName, {
    x: sigX,
    y: sigY + 14,
    size: 11,
    font: timesBold,
    color: rgb(navy.r, navy.g, navy.b),
  });
  page.drawText(ctx.issuerRole, {
    x: sigX,
    y: sigY,
    size: 8,
    font: helvOblique,
    color: rgb(mute.r, mute.g, mute.b),
  });

  // QR module — bottom-right, clean frame
  const qrImage = await pdf.embedPng(ctx.qrPng);
  const qrSize = 82;
  const qrX = width - rightPad - qrSize;
  const qrY = 66;
  // Frame
  page.drawRectangle({
    x: qrX - 10,
    y: qrY - 10,
    width: qrSize + 20,
    height: qrSize + 20,
    color: rgb(1, 1, 1),
    borderColor: rgb(navy.r, navy.g, navy.b),
    borderWidth: 0.8,
  });
  // Corner ticks
  const cornerTick = (bx: number, by: number, hFlip: number, vFlip: number) => {
    page.drawRectangle({
      x: bx,
      y: by,
      width: 8 * hFlip,
      height: 1.4,
      color: rgb(cyan.r, cyan.g, cyan.b),
    });
    page.drawRectangle({
      x: bx,
      y: by,
      width: 1.4,
      height: 8 * vFlip,
      color: rgb(cyan.r, cyan.g, cyan.b),
    });
  };
  cornerTick(qrX - 10, qrY + qrSize + 10, 1, -1);
  cornerTick(qrX + qrSize + 10, qrY + qrSize + 10, -1, -1);
  cornerTick(qrX - 10, qrY - 10, 1, 1);
  cornerTick(qrX + qrSize + 10, qrY - 10, -1, 1);
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  page.drawText("VERIFY", {
    x: qrX,
    y: qrY - 22,
    size: 7,
    font: monoBold,
    color: rgb(mute.r, mute.g, mute.b),
  });
  page.drawText(ctx.validationCode, {
    x: qrX,
    y: qrY - 32,
    size: 8,
    font: monoBold,
    color: rgb(navy.r, navy.g, navy.b),
  });

  // Legal footer — very small, italic, right-aligned near bottom edge
  const footerLines = wrapText(ctx.legalFooter, helvOblique, 6.5, width - cx - 30);
  let fy = 30;
  for (const line of footerLines.slice(0, 2)) {
    page.drawText(line, {
      x: cx,
      y: fy,
      size: 6.5,
      font: helvOblique,
      color: rgb(0.55, 0.58, 0.66),
    });
    fy -= 8;
  }

  return pdf.save();
}

// ---------- Template 2 — Dark Premium Tech ----------
/**
 * Deep midnight canvas. Corner brackets [ ] like a HUD, subtle grid, dual glow
 * (cyan + violet), monospace credential ID top, oversized display name with
 * gradient-feel highlight, holographic seal disc bottom-right.
 */
async function renderDarkPremiumTech(
  ctx: RenderContext
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await loadPdfLib();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const monoBold = await pdf.embedFont(StandardFonts.CourierBold);

  // Palette
  const bg = { r: 0.02, g: 0.031, b: 0.078 }; // near-black midnight
  const bg2 = { r: 0.043, g: 0.063, b: 0.129 };
  const cyan = { r: 0.133, g: 0.827, b: 0.933 };
  const violet = { r: 0.655, g: 0.545, b: 1 };
  const text = { r: 0.95, g: 0.97, b: 1 };
  const muted = { r: 0.6, g: 0.66, b: 0.85 };

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(bg.r, bg.g, bg.b) });

  // Layered radial-ish glows (stacked ellipses)
  for (let i = 4; i > 0; i--) {
    page.drawEllipse({
      x: 120,
      y: height - 90,
      xScale: 90 + i * 60,
      yScale: 90 + i * 60,
      color: rgb(cyan.r, cyan.g, cyan.b),
      opacity: 0.05,
    });
    page.drawEllipse({
      x: width - 130,
      y: 110,
      xScale: 90 + i * 60,
      yScale: 90 + i * 60,
      color: rgb(violet.r, violet.g, violet.b),
      opacity: 0.05,
    });
  }

  // Fine grid
  const gridColor = rgb(violet.r, violet.g, violet.b);
  for (let x = 48; x < width - 48; x += 28) {
    page.drawLine({
      start: { x, y: 48 },
      end: { x, y: height - 48 },
      thickness: 0.3,
      color: gridColor,
      opacity: 0.08,
    });
  }
  for (let y = 60; y < height - 60; y += 28) {
    page.drawLine({
      start: { x: 48, y },
      end: { x: width - 48, y },
      thickness: 0.3,
      color: gridColor,
      opacity: 0.08,
    });
  }

  // HUD corner brackets
  const bracket = (bx: number, by: number, sx: number, sy: number) => {
    page.drawRectangle({
      x: bx,
      y: by,
      width: 28 * sx,
      height: 1.6,
      color: rgb(cyan.r, cyan.g, cyan.b),
    });
    page.drawRectangle({
      x: bx,
      y: by,
      width: 1.6,
      height: 28 * sy,
      color: rgb(cyan.r, cyan.g, cyan.b),
    });
  };
  bracket(38, height - 38, 1, -1);
  bracket(width - 38, height - 38, -1, -1);
  bracket(38, 38, 1, 1);
  bracket(width - 38, 38, -1, 1);

  // Inner frame (very subtle)
  page.drawRectangle({
    x: 52,
    y: 52,
    width: width - 104,
    height: height - 104,
    borderColor: rgb(violet.r, violet.g, violet.b),
    borderOpacity: 0.35,
    borderWidth: 0.6,
  });

  // Top header row — institution left, credential ID right
  page.drawText(ctx.institutionName.toUpperCase(), {
    x: 72,
    y: height - 78,
    size: 11,
    font: helvBold,
    color: rgb(cyan.r, cyan.g, cyan.b),
  });
  page.drawText("· DIGITAL CREDENTIAL", {
    x: 72 + helvBold.widthOfTextAtSize(ctx.institutionName.toUpperCase(), 11) + 8,
    y: height - 78,
    size: 8,
    font: helv,
    color: rgb(muted.r, muted.g, muted.b),
  });

  const credLabel = `ID · ${ctx.validationCode}`;
  const credW = monoBold.widthOfTextAtSize(credLabel, 9);
  page.drawText(credLabel, {
    x: width - 72 - credW,
    y: height - 78,
    size: 9,
    font: monoBold,
    color: rgb(text.r, text.g, text.b),
  });

  // Eyebrow
  drawCentered(page, "OFFICIALLY ISSUED · VERIFIED ON-CHAIN VIA FCIA.ID", height - 128, mono, 7.5, muted);

  // Title (H1)
  drawCentered(page, ctx.certificateTitle.toUpperCase(), height - 168, helvBold, 22, text);

  // Cyan divider under title
  const dividerW = 60;
  page.drawRectangle({
    x: (width - dividerW) / 2,
    y: height - 180,
    width: dividerW,
    height: 1.8,
    color: rgb(cyan.r, cyan.g, cyan.b),
  });

  // Student name — display, big
  const nameSize = fitName(ctx.studentName, helvBold, 44, width - 200, 26);
  drawCentered(page, ctx.studentName, height - 235, helvBold, nameSize, {
    r: 0.88,
    g: 0.94,
    b: 1,
  });

  // Body
  let cy = height - 275;
  const bodyLines = wrapText(ctx.bodyText, helv, 11, width - 220);
  for (const line of bodyLines.slice(0, 4)) {
    drawCentered(page, line, cy, helv, 11, {
      r: 0.82,
      g: 0.87,
      b: 0.98,
    });
    cy -= 15;
  }

  // Meta row (monospace chips)
  const metaY = 168;
  const chips: Array<[string, string]> = [
    ["WORKLOAD", `${ctx.workloadHours}H`],
    ["COMPLETED", ctx.completionDate.toUpperCase()],
    ["ISSUED", ctx.issuedDate.toUpperCase()],
    ["TRACK", (ctx.trackTitle || "FCIA").toUpperCase()],
  ];
  const chipW = 140;
  const totalW = chipW * chips.length + 16 * (chips.length - 1);
  let chipX = (width - totalW) / 2;
  for (const [label, value] of chips) {
    page.drawRectangle({
      x: chipX,
      y: metaY - 4,
      width: chipW,
      height: 46,
      color: rgb(bg2.r, bg2.g, bg2.b),
      borderColor: rgb(violet.r, violet.g, violet.b),
      borderOpacity: 0.35,
      borderWidth: 0.6,
    });
    // top cyan tick
    page.drawRectangle({
      x: chipX,
      y: metaY + 42,
      width: 16,
      height: 1.6,
      color: rgb(cyan.r, cyan.g, cyan.b),
    });
    page.drawText(label, {
      x: chipX + 12,
      y: metaY + 26,
      size: 7,
      font: monoBold,
      color: rgb(muted.r, muted.g, muted.b),
    });
    page.drawText(value, {
      x: chipX + 12,
      y: metaY + 10,
      size: 11,
      font: monoBold,
      color: rgb(text.r, text.g, text.b),
    });
    chipX += chipW + 16;
  }

  // Signature bottom-left
  const sigX = 78;
  const sigY = 92;
  page.drawLine({
    start: { x: sigX, y: sigY + 30 },
    end: { x: sigX + 240, y: sigY + 30 },
    thickness: 0.8,
    color: rgb(0.5, 0.55, 0.85),
  });
  page.drawText(ctx.issuerName, {
    x: sigX,
    y: sigY + 12,
    size: 12,
    font: helvBold,
    color: rgb(1, 1, 1),
  });
  page.drawText(ctx.issuerRole, {
    x: sigX,
    y: sigY - 2,
    size: 9,
    font: helvOblique,
    color: rgb(muted.r, muted.g, muted.b),
  });

  // Holographic seal + QR (bottom-right)
  const qrImage = await pdf.embedPng(ctx.qrPng);
  const qrSize = 92;
  const qrX = width - 78 - qrSize;
  const qrY = 92;

  // Seal ring behind QR
  page.drawEllipse({
    x: qrX + qrSize / 2,
    y: qrY + qrSize / 2,
    xScale: qrSize / 2 + 22,
    yScale: qrSize / 2 + 22,
    color: rgb(cyan.r, cyan.g, cyan.b),
    opacity: 0.16,
  });
  page.drawEllipse({
    x: qrX + qrSize / 2,
    y: qrY + qrSize / 2,
    xScale: qrSize / 2 + 14,
    yScale: qrSize / 2 + 14,
    color: rgb(violet.r, violet.g, violet.b),
    opacity: 0.18,
  });
  // White QR plate
  page.drawRectangle({
    x: qrX - 6,
    y: qrY - 6,
    width: qrSize + 12,
    height: qrSize + 12,
    color: rgb(1, 1, 1),
  });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  page.drawText("SCAN · VERIFY", {
    x:
      qrX + (qrSize - monoBold.widthOfTextAtSize("SCAN · VERIFY", 7)) / 2,
    y: qrY - 18,
    size: 7,
    font: monoBold,
    color: rgb(cyan.r, cyan.g, cyan.b),
  });

  // Legal footer
  const footerLines = wrapText(ctx.legalFooter, helvOblique, 7, width - 200);
  let fy = 56;
  for (const line of footerLines.slice(0, 2)) {
    drawCentered(page, line, fy, helvOblique, 7, {
      r: 0.55,
      g: 0.6,
      b: 0.78,
    });
    fy -= 9;
  }

  return pdf.save();
}

// ---------- Template 3 — Editorial Prestige ----------
/**
 * Bone paper canvas. Double thin charcoal frame + rose-gold inner rule.
 * Small serif caps hierarchy, oversized year mark, ornamental dot separators,
 * centered composition with extreme respiro.
 */
async function renderEditorialPrestige(
  ctx: RenderContext
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await loadPdfLib();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const times = await pdf.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  // Palette — bone paper, charcoal, rose-gold
  const paper = { r: 0.984, g: 0.976, b: 0.957 };
  const paperShade = { r: 0.96, g: 0.945, b: 0.918 };
  const ink = { r: 0.098, g: 0.106, b: 0.129 };
  const gold = { r: 0.69, g: 0.502, b: 0.314 };
  const muted = { r: 0.42, g: 0.4, b: 0.35 };

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(paper.r, paper.g, paper.b) });

  // Subtle vignette top and bottom
  page.drawRectangle({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    color: rgb(paperShade.r, paperShade.g, paperShade.b),
    opacity: 0.4,
  });
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 60,
    color: rgb(paperShade.r, paperShade.g, paperShade.b),
    opacity: 0.4,
  });

  // Double frame
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(ink.r, ink.g, ink.b),
    borderWidth: 0.6,
  });
  page.drawRectangle({
    x: 42,
    y: 42,
    width: width - 84,
    height: height - 84,
    borderColor: rgb(gold.r, gold.g, gold.b),
    borderWidth: 0.6,
  });

  // Ornamental corner marks (small filled squares diamond-rotated feel)
  const orn = (x: number, y: number) => {
    page.drawRectangle({
      x: x - 2,
      y: y - 2,
      width: 4,
      height: 4,
      color: rgb(gold.r, gold.g, gold.b),
    });
  };
  orn(42, 42);
  orn(width - 42, 42);
  orn(42, height - 42);
  orn(width - 42, height - 42);

  // Header
  drawCentered(page, ctx.institutionName.toUpperCase(), height - 88, helvBold, 10, ink);
  // small gold divider
  const dW = 42;
  page.drawRectangle({
    x: (width - dW) / 2,
    y: height - 100,
    width: dW,
    height: 0.8,
    color: rgb(gold.r, gold.g, gold.b),
  });

  // Big year mark, right-aligned inside frame
  const year = new Date(ctx.issuedDate).getFullYear().toString();
  const yearSafe = /^\d{4}$/.test(year) ? year : new Date().getFullYear().toString();
  page.drawText(yearSafe, {
    x: width - 130,
    y: height - 82,
    size: 34,
    font: times,
    color: rgb(gold.r, gold.g, gold.b),
    opacity: 0.55,
  });

  // Title
  drawCentered(page, ctx.certificateTitle, height - 152, times, 32, ink);

  // "This is to certify that"
  drawCentered(page, "· concedido a ·", height - 188, timesItalic, 11, muted);

  // Student name — serif bold, big
  const nameSize = fitName(ctx.studentName, timesBold, 34, width - 220, 22);
  drawCentered(page, ctx.studentName, height - 232, timesBold, nameSize, ink);

  // Thin gold rule under name
  const rule = 260;
  page.drawRectangle({
    x: (width - rule) / 2,
    y: height - 246,
    width: rule,
    height: 0.6,
    color: rgb(gold.r, gold.g, gold.b),
  });

  // Body
  const bodyLines = wrapText(ctx.bodyText, times, 12, width - 260);
  let cy = height - 278;
  for (const line of bodyLines.slice(0, 4)) {
    drawCentered(page, line, cy, times, 12, {
      r: 0.22,
      g: 0.22,
      b: 0.25,
    });
    cy -= 17;
  }

  // Meta line (italic, dotted separators)
  const metaLine = `carga horária de ${ctx.workloadHours}h  ·  concluído em ${ctx.completionDate}`;
  drawCentered(page, metaLine, cy - 8, timesItalic, 11, {
    r: 0.4,
    g: 0.38,
    b: 0.32,
  });

  // Signature block centered
  page.drawLine({
    start: { x: width / 2 - 130, y: 154 },
    end: { x: width / 2 + 130, y: 154 },
    thickness: 0.6,
    color: rgb(ink.r, ink.g, ink.b),
  });
  drawCentered(page, ctx.issuerName, 138, timesBold, 13, ink);
  drawCentered(page, ctx.issuerRole.toUpperCase(), 124, helv, 8, muted);

  // Left column — Code (monospaced) + date
  page.drawText("CÓDIGO", {
    x: 78,
    y: 112,
    size: 7,
    font: helvBold,
    color: rgb(muted.r, muted.g, muted.b),
  });
  page.drawText(ctx.validationCode, {
    x: 78,
    y: 96,
    size: 10,
    font: mono,
    color: rgb(ink.r, ink.g, ink.b),
  });
  page.drawText("EMISSÃO", {
    x: 78,
    y: 78,
    size: 7,
    font: helvBold,
    color: rgb(muted.r, muted.g, muted.b),
  });
  page.drawText(ctx.issuedDate, {
    x: 78,
    y: 66,
    size: 9,
    font: times,
    color: rgb(ink.r, ink.g, ink.b),
  });

  // Right column — QR (small, discreet, no frame)
  const qrImage = await pdf.embedPng(ctx.qrPng);
  const qrSize = 66;
  const qrX = width - 78 - qrSize;
  const qrY = 74;
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  page.drawText("VALIDAR", {
    x: qrX + (qrSize - helvBold.widthOfTextAtSize("VALIDAR", 7)) / 2,
    y: qrY - 12,
    size: 7,
    font: helvBold,
    color: rgb(gold.r, gold.g, gold.b),
  });

  // Legal footer, very fine
  const footerLines = wrapText(ctx.legalFooter, helvOblique, 6.5, width - 280);
  let fy = 46;
  for (const line of footerLines.slice(0, 2)) {
    drawCentered(page, line, fy, helvOblique, 6.5, {
      r: 0.5,
      g: 0.48,
      b: 0.42,
    });
    fy -= 8.5;
  }

  return pdf.save();
}

// ---------- dispatch ----------

export async function renderCertificatePdf(
  templateKey: TemplateKey,
  ctx: RenderContext
): Promise<Uint8Array> {
  switch (templateKey) {
    case "executive_tech":
      return renderExecutiveTech(ctx);
    case "editorial_prestige":
      return renderEditorialPrestige(ctx);
    case "dark_premium_tech":
    default:
      return renderDarkPremiumTech(ctx);
  }
}

// Keep type imports referenced (some TS setups treat unused type imports as warnings).
export type _KeepTypes = PDFDocument | PDFPage;
