/**
 * Certificate template registry.
 *
 * Three premium visual directions, all sharing the same dynamic-field contract
 * so switching templates is purely a rendering swap. Each renderer receives a
 * `RenderContext` and returns a Uint8Array PDF ready to upload.
 *
 * Dynamic fields injected in every template:
 *   student_name, course_title, workload_hours, completion_date, issued_date,
 *   validation_code, verification_url, institution_name, issuer_name,
 *   issuer_role, track_title, legal_footer, certificate_title, qrPng.
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
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    key: "executive_tech",
    name: "Executive Tech",
    tagline: "Horizontal · Institucional · Tech refinado",
    description:
      "Layout limpo com tipografia forte, nome do aluno em destaque e assinatura elegante. Sensação de MBA executivo com estética moderna.",
    vibe: "light",
  },
  {
    key: "dark_premium_tech",
    name: "Dark Premium Tech",
    tagline: "Fundo escuro · Grid digital · Alto contraste",
    description:
      "Certificado premium com linhas sutis e elementos digitais discretos. Feito para cursos de IA, automação e tecnologia.",
    vibe: "dark",
  },
  {
    key: "editorial_prestige",
    name: "Editorial Prestige",
    tagline: "Base clara · Atemporal · Composição editorial",
    description:
      "Estilo elegante com muito respiro visual e assinatura institucional valorizada. Ideal para impressão e compartilhamento.",
    vibe: "ivory",
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
  color: { r: number; g: number; b: number }
) {
  const { width } = page.getSize();
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (width - w) / 2,
    y,
    size,
    font,
    color: rgb(color.r, color.g, color.b),
  });
}

// rgb helper (lazy import of pdf-lib rgb inside renderers to keep bundle graph clean)
let _rgb: typeof import("pdf-lib").rgb;
function rgb(r: number, g: number, b: number) {
  return _rgb(r, g, b);
}

// ---------- renderers ----------

async function loadPdfLib() {
  const lib = await import("pdf-lib");
  _rgb = lib.rgb;
  return lib;
}

/**
 * Template 1 — Executive Tech
 * Landscape, ivory-white background, navy accents. Bold student name on the
 * left, meta column on the right, signature and QR anchored at the bottom.
 */
async function renderExecutiveTech(ctx: RenderContext): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await loadPdfLib();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  // Ivory background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.972, 0.976, 0.984),
  });

  // Top navy bar
  page.drawRectangle({
    x: 0,
    y: height - 46,
    width,
    height: 46,
    color: rgb(0.039, 0.102, 0.227),
  });
  // Electric blue accent line
  page.drawRectangle({
    x: 0,
    y: height - 50,
    width,
    height: 4,
    color: rgb(0.231, 0.435, 0.961),
  });

  page.drawText(ctx.institutionName.toUpperCase(), {
    x: 48,
    y: height - 30,
    size: 11,
    font: helvBold,
    color: rgb(1, 1, 1),
  });
  const trackTxt = ctx.trackTitle.toUpperCase();
  page.drawText(trackTxt, {
    x: width - 48 - helv.widthOfTextAtSize(trackTxt, 9),
    y: height - 29,
    size: 9,
    font: helv,
    color: rgb(0.75, 0.82, 0.98),
  });

  // Left column: label + student name + body
  const leftX = 60;
  let cy = height - 110;

  page.drawText("CERTIFICADO", {
    x: leftX,
    y: cy,
    size: 10,
    font: helvBold,
    color: rgb(0.231, 0.435, 0.961),
  });
  cy -= 14;
  page.drawText(ctx.certificateTitle.toUpperCase(), {
    x: leftX,
    y: cy,
    size: 11,
    font: helv,
    color: rgb(0.35, 0.4, 0.55),
  });

  cy -= 60;
  // Student name — very large, tight tracking feel
  const nameSize = 34;
  const maxNameWidth = width - leftX - 60;
  let displayName = ctx.studentName;
  while (
    timesBold.widthOfTextAtSize(displayName, nameSize) > maxNameWidth &&
    displayName.length > 4
  ) {
    displayName = displayName.slice(0, -1);
  }
  page.drawText(displayName, {
    x: leftX,
    y: cy,
    size: nameSize,
    font: timesBold,
    color: rgb(0.039, 0.102, 0.227),
  });
  cy -= 8;
  // underline accent
  page.drawRectangle({
    x: leftX,
    y: cy - 4,
    width: 80,
    height: 2,
    color: rgb(0.231, 0.435, 0.961),
  });

  cy -= 30;
  const bodyLines = wrapText(ctx.bodyText, helv, 11, width - leftX - 60);
  for (const line of bodyLines) {
    page.drawText(line, {
      x: leftX,
      y: cy,
      size: 11,
      font: helv,
      color: rgb(0.18, 0.22, 0.32),
    });
    cy -= 16;
  }

  // Meta chips
  const metaY = 180;
  const chips: Array<[string, string]> = [
    ["CARGA HORÁRIA", `${ctx.workloadHours}h`],
    ["CONCLUSÃO", ctx.completionDate],
    ["EMITIDO EM", ctx.issuedDate],
    ["CÓDIGO", ctx.validationCode],
  ];
  let chipX = leftX;
  for (const [label, value] of chips) {
    page.drawText(label, {
      x: chipX,
      y: metaY + 18,
      size: 7,
      font: helvBold,
      color: rgb(0.45, 0.5, 0.62),
    });
    page.drawText(value, {
      x: chipX,
      y: metaY,
      size: 11,
      font: helvBold,
      color: rgb(0.039, 0.102, 0.227),
    });
    chipX += 165;
  }

  // Signature block bottom-left
  const sigX = leftX;
  const sigY = 90;
  page.drawLine({
    start: { x: sigX, y: sigY + 28 },
    end: { x: sigX + 240, y: sigY + 28 },
    thickness: 1,
    color: rgb(0.039, 0.102, 0.227),
  });
  page.drawText(ctx.issuerName, {
    x: sigX,
    y: sigY + 12,
    size: 11,
    font: helvBold,
    color: rgb(0.039, 0.102, 0.227),
  });
  page.drawText(ctx.issuerRole, {
    x: sigX,
    y: sigY - 2,
    size: 9,
    font: helvOblique,
    color: rgb(0.4, 0.44, 0.55),
  });

  // QR bottom-right
  const qrImage = await pdf.embedPng(ctx.qrPng);
  const qrSize = 88;
  const qrX = width - 60 - qrSize;
  const qrY = 70;
  page.drawRectangle({
    x: qrX - 8,
    y: qrY - 8,
    width: qrSize + 16,
    height: qrSize + 16,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.039, 0.102, 0.227),
    borderWidth: 0.8,
  });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  page.drawText("VALIDAÇÃO", {
    x: qrX + (qrSize - helvBold.widthOfTextAtSize("VALIDAÇÃO", 7)) / 2,
    y: qrY - 20,
    size: 7,
    font: helvBold,
    color: rgb(0.45, 0.5, 0.62),
  });
  page.drawText(ctx.validationCode, {
    x: qrX + (qrSize - helvBold.widthOfTextAtSize(ctx.validationCode, 8)) / 2,
    y: qrY - 30,
    size: 8,
    font: helvBold,
    color: rgb(0.039, 0.102, 0.227),
  });

  // Legal footer at very bottom
  const footerLines = wrapText(ctx.legalFooter, helvOblique, 7, width - 120);
  let fy = 34;
  for (const line of footerLines.slice(0, 2)) {
    drawCentered(page, line, fy, helvOblique, 7, {
      r: 0.5,
      g: 0.55,
      b: 0.66,
    });
    fy -= 9;
  }

  return pdf.save();
}

/**
 * Template 2 — Dark Premium Tech
 * Deep navy background, subtle grid, electric blue + violet accents. Ideal
 * for AI / tech courses.
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

  // Dark background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.043, 0.063, 0.118),
  });

  // Ambient blobs
  page.drawEllipse({
    x: 90,
    y: height - 60,
    xScale: 200,
    yScale: 200,
    color: rgb(0.235, 0.361, 1),
    opacity: 0.14,
  });
  page.drawEllipse({
    x: width - 90,
    y: 60,
    xScale: 220,
    yScale: 220,
    color: rgb(0.655, 0.545, 1),
    opacity: 0.14,
  });

  // Subtle grid
  const gridColor = rgb(0.42, 0.36, 1);
  const gridOpacity = 0.09;
  for (let x = 60; x < width - 60; x += 40) {
    page.drawLine({
      start: { x, y: 60 },
      end: { x, y: height - 60 },
      thickness: 0.4,
      color: gridColor,
      opacity: gridOpacity,
    });
  }
  for (let y = 80; y < height - 80; y += 40) {
    page.drawLine({
      start: { x: 60, y },
      end: { x: width - 60, y },
      thickness: 0.4,
      color: gridColor,
      opacity: gridOpacity,
    });
  }

  // Frame
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: rgb(0.42, 0.36, 1),
    borderWidth: 1.4,
  });
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: rgb(0.42, 0.36, 1),
    borderOpacity: 0.35,
    borderWidth: 0.6,
  });

  // Header labels
  page.drawText(ctx.institutionName.toUpperCase(), {
    x: 60,
    y: height - 78,
    size: 12,
    font: helvBold,
    color: rgb(0.6, 0.7, 1),
  });
  const trackTxt = ctx.trackTitle.toUpperCase();
  page.drawText(trackTxt, {
    x: width - 60 - helv.widthOfTextAtSize(trackTxt, 10),
    y: height - 78,
    size: 10,
    font: helv,
    color: rgb(0.7, 0.75, 0.95),
  });

  // Title
  drawCentered(
    page,
    ctx.certificateTitle,
    height - 140,
    helvBold,
    30,
    { r: 1, g: 1, b: 1 }
  );

  // Student name
  drawCentered(page, ctx.studentName, height - 190, helvBold, 26, {
    r: 0.63,
    g: 0.78,
    b: 1,
  });

  // Body wrapped
  const bodyLines = wrapText(ctx.bodyText, helv, 11, width - 160);
  let cy = height - 235;
  for (const line of bodyLines) {
    drawCentered(page, line, cy, helv, 11, {
      r: 0.88,
      g: 0.9,
      b: 0.98,
    });
    cy -= 16;
  }

  // Signature
  const sigX = 90;
  const sigY = 140;
  page.drawLine({
    start: { x: sigX, y: sigY + 30 },
    end: { x: sigX + 260, y: sigY + 30 },
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
    y: sigY - 4,
    size: 10,
    font: helvOblique,
    color: rgb(0.75, 0.8, 0.95),
  });

  // QR
  const qrImage = await pdf.embedPng(ctx.qrPng);
  const qrSize = 100;
  const qrX = width - 90 - qrSize;
  const qrY = 110;
  page.drawRectangle({
    x: qrX - 8,
    y: qrY - 8,
    width: qrSize + 16,
    height: qrSize + 16,
    color: rgb(1, 1, 1),
  });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  page.drawText(ctx.validationCode, {
    x: qrX + (qrSize - helvBold.widthOfTextAtSize(ctx.validationCode, 9)) / 2,
    y: qrY - 22,
    size: 9,
    font: helvBold,
    color: rgb(1, 1, 1),
  });
  const verifyLabel = `Emitido em ${ctx.issuedDate}`;
  page.drawText(verifyLabel, {
    x: qrX + (qrSize - helv.widthOfTextAtSize(verifyLabel, 7)) / 2,
    y: qrY - 34,
    size: 7,
    font: helv,
    color: rgb(0.6, 0.65, 0.85),
  });

  // Legal footer
  const footerLines = wrapText(ctx.legalFooter, helvOblique, 8, width - 120);
  let fy = 70;
  for (const line of footerLines.slice(0, 3)) {
    drawCentered(page, line, fy, helvOblique, 8, {
      r: 0.65,
      g: 0.7,
      b: 0.85,
    });
    fy -= 10;
  }

  return pdf.save();
}

/**
 * Template 3 — Editorial Prestige
 * Ivory canvas, timeless typographic composition. Serif title, thin gold
 * dividers, centered vertical rhythm — feels like a limited-edition book.
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
  const timesRegular = await pdf.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  // Ivory / paper background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.98, 0.972, 0.945),
  });

  // Outer hairline frame (charcoal)
  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: rgb(0.11, 0.115, 0.14),
    borderWidth: 0.8,
  });

  // Header — institution name centered, small serif italic
  drawCentered(
    page,
    ctx.institutionName.toUpperCase(),
    height - 78,
    helvBold,
    10,
    { r: 0.11, g: 0.115, b: 0.14 }
  );

  // Gold divider (short)
  const dividerY = height - 92;
  const dividerW = 60;
  page.drawRectangle({
    x: (width - dividerW) / 2,
    y: dividerY,
    width: dividerW,
    height: 1.4,
    color: rgb(0.72, 0.58, 0.24),
  });

  // Certificate title (serif, large)
  drawCentered(page, ctx.certificateTitle, height - 140, timesRegular, 32, {
    r: 0.11,
    g: 0.115,
    b: 0.14,
  });

  drawCentered(
    page,
    "Concedido a",
    height - 175,
    helvOblique,
    11,
    { r: 0.35, g: 0.32, b: 0.28 }
  );

  // Student name — serif bold, large
  drawCentered(page, ctx.studentName, height - 218, timesBold, 30, {
    r: 0.11,
    g: 0.115,
    b: 0.14,
  });

  // Thin gold underline
  const nameUnderlineW = 220;
  page.drawRectangle({
    x: (width - nameUnderlineW) / 2,
    y: height - 232,
    width: nameUnderlineW,
    height: 0.8,
    color: rgb(0.72, 0.58, 0.24),
  });

  // Body text (serif italic for editorial feel, else regular)
  const bodyLines = wrapText(ctx.bodyText, timesRegular, 12, width - 200);
  let cy = height - 268;
  for (const line of bodyLines) {
    drawCentered(page, line, cy, timesRegular, 12, {
      r: 0.22,
      g: 0.22,
      b: 0.27,
    });
    cy -= 18;
  }

  // Meta line (workload + date)
  const metaLine = `Carga horária de ${ctx.workloadHours}h · Concluído em ${ctx.completionDate}`;
  drawCentered(page, metaLine, cy - 8, timesItalic, 11, {
    r: 0.4,
    g: 0.38,
    b: 0.32,
  });

  // Signature centered
  const sigCenterX = width / 2;
  page.drawLine({
    start: { x: sigCenterX - 130, y: 138 },
    end: { x: sigCenterX + 130, y: 138 },
    thickness: 0.6,
    color: rgb(0.11, 0.115, 0.14),
  });
  drawCentered(page, ctx.issuerName, 120, timesBold, 12, {
    r: 0.11,
    g: 0.115,
    b: 0.14,
  });
  drawCentered(page, ctx.issuerRole, 106, helvOblique, 9, {
    r: 0.4,
    g: 0.38,
    b: 0.32,
  });

  // QR discreet at bottom-right
  const qrImage = await pdf.embedPng(ctx.qrPng);
  const qrSize = 62;
  const qrX = width - 68 - qrSize;
  const qrY = 60;
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });
  page.drawText("Validar", {
    x: qrX + (qrSize - helvBold.widthOfTextAtSize("Validar", 7)) / 2,
    y: qrY - 12,
    size: 7,
    font: helvBold,
    color: rgb(0.4, 0.38, 0.32),
  });

  // Code at bottom-left
  page.drawText(`Código: ${ctx.validationCode}`, {
    x: 68,
    y: 78,
    size: 8,
    font: helv,
    color: rgb(0.4, 0.38, 0.32),
  });
  page.drawText(`Emitido em ${ctx.issuedDate}`, {
    x: 68,
    y: 66,
    size: 8,
    font: helv,
    color: rgb(0.4, 0.38, 0.32),
  });

  // Legal footer, very fine italic
  const footerLines = wrapText(ctx.legalFooter, helvOblique, 7, width - 260);
  let fy = 46;
  for (const line of footerLines.slice(0, 2)) {
    drawCentered(page, line, fy, helvOblique, 7, {
      r: 0.5,
      g: 0.48,
      b: 0.42,
    });
    fy -= 9;
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

// Silence "unused" for PDFDocument/PDFPage type imports in some TS setups.
export type _KeepTypes = PDFDocument | PDFPage;
