import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type GenerateInput = { certificateId: string };

const BUCKET = "certificates";

function applyTemplate(
  tpl: string,
  vars: Record<string, string | number | null | undefined>
) {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const v = vars[key];
    return v == null ? "" : String(v);
  });
}

async function generateCertificateInternal(
  supabase: SupabaseClient,
  userId: string,
  certificateId: string
) {
  const { data: cert, error: cErr } = await supabase
    .from("certificates")
    .select(
      "id, user_id, course_id, validation_code, pdf_url, issued_at, completion_date, student_name_snapshot, course_title_snapshot, workload_hours_snapshot, verification_url, courses(title, workload_hours, tracks(title))"
    )
    .eq("id", certificateId)
    .maybeSingle();
  if (cErr) throw new Error(cErr.message);
  if (!cert) throw new Error("Certificado não encontrado");
  if (cert.user_id !== userId) throw new Error("Forbidden");

  if (cert.pdf_url) return { path: cert.pdf_url, alreadyExists: true };

  // Load institutional settings
  const { data: settings } = await supabase
    .from("certificate_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const course: any = Array.isArray(cert.courses) ? cert.courses[0] : cert.courses;
  const track: any = course?.tracks
    ? Array.isArray(course.tracks)
      ? course.tracks[0]
      : course.tracks
    : null;

  const studentName =
    cert.student_name_snapshot || profile?.full_name || "Aluno FCIA";
  const courseTitle = cert.course_title_snapshot || course?.title || "Curso FCIA";
  const workload = Number(
    cert.workload_hours_snapshot ?? course?.workload_hours ?? 0
  );
  const completion = cert.completion_date
    ? new Date(cert.completion_date)
    : new Date(cert.issued_at);
  const completionStr = completion.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const issuedAt = new Date(cert.issued_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const institutionName = settings?.institution_name || "FCIA Academy";
  const trackTitle = track?.title || institutionName;
  const certificateTitle = settings?.certificate_title || "Certificado de Conclusão";
  const bodyTemplate =
    settings?.body_template ||
    "A FCIA Academy certifica que {{student_name}} concluiu com aproveitamento o curso livre de capacitação e atualização profissional {{course_title}}, com carga horária total de {{workload_hours}} horas, concluído em {{completion_date}}.";
  const legalFooter =
    settings?.legal_footer ||
    "Curso livre de capacitação e atualização profissional, sem equivalência a diploma de curso técnico, graduação ou pós-graduação, e sem declaração de reconhecimento pelo MEC.";
  const issuerName = settings?.issuer_name || "Prof. Fernando Cabral";
  const issuerRole = settings?.issuer_role || "CEO & Founder — FCIA";
  const validationBase =
    settings?.validation_base_url ||
    "https://fciaacademy.lovable.app/validar-certificado";

  const validateUrl =
    cert.verification_url || `${validationBase}/${cert.validation_code}`;

  const bodyText = applyTemplate(bodyTemplate, {
    student_name: studentName,
    course_title: courseTitle,
    workload_hours: workload,
    completion_date: completionStr,
    institution_name: institutionName,
  });

  // QR
  const QRCode = (await import("qrcode")).default;
  const qrDataUrl = await QRCode.toDataURL(validateUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#0b0f1e", light: "#ffffff" },
  });
  const qrPngBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]), (c) =>
    c.charCodeAt(0)
  );

  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.043, 0.063, 0.118) });
  page.drawEllipse({ x: 90, y: height - 60, xScale: 180, yScale: 180, color: rgb(0.235, 0.361, 1), opacity: 0.14 });
  page.drawEllipse({ x: width - 90, y: 60, xScale: 200, yScale: 200, color: rgb(0.655, 0.545, 1), opacity: 0.14 });

  page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: rgb(0.42, 0.36, 1), borderWidth: 1.4 });
  page.drawRectangle({ x: 40, y: 40, width: width - 80, height: height - 80, borderColor: rgb(0.42, 0.36, 1), borderOpacity: 0.35, borderWidth: 0.6 });

  page.drawText(institutionName.toUpperCase(), {
    x: 60,
    y: height - 78,
    size: 12,
    font: helvBold,
    color: rgb(0.6, 0.7, 1),
  });
  page.drawText(trackTitle.toUpperCase(), {
    x: width - 60 - helv.widthOfTextAtSize(trackTitle.toUpperCase(), 10),
    y: height - 78,
    size: 10,
    font: helv,
    color: rgb(0.7, 0.75, 0.95),
  });

  const titleSize = 30;
  page.drawText(certificateTitle, {
    x: (width - helvBold.widthOfTextAtSize(certificateTitle, titleSize)) / 2,
    y: height - 140,
    size: titleSize,
    font: helvBold,
    color: rgb(1, 1, 1),
  });

  // Student name highlight
  const nameSize = 26;
  page.drawText(studentName, {
    x: (width - helvBold.widthOfTextAtSize(studentName, nameSize)) / 2,
    y: height - 190,
    size: nameSize,
    font: helvBold,
    color: rgb(0.63, 0.78, 1),
  });

  // Body: wrap
  const bodyLines = wrapText(bodyText, helv, 11, width - 160);
  let cursorY = height - 235;
  for (const line of bodyLines) {
    page.drawText(line, {
      x: (width - helv.widthOfTextAtSize(line, 11)) / 2,
      y: cursorY,
      size: 11,
      font: helv,
      color: rgb(0.88, 0.9, 0.98),
    });
    cursorY -= 16;
  }

  // Assinatura
  const sigX = 90;
  const sigY = 140;
  page.drawLine({ start: { x: sigX, y: sigY + 30 }, end: { x: sigX + 260, y: sigY + 30 }, color: rgb(0.5, 0.55, 0.85), thickness: 0.8 });
  page.drawText(issuerName, { x: sigX, y: sigY + 12, size: 12, font: helvBold, color: rgb(1, 1, 1) });
  page.drawText(issuerRole, { x: sigX, y: sigY - 4, size: 10, font: helvOblique, color: rgb(0.75, 0.8, 0.95) });

  // QR
  const qrImage = await pdf.embedPng(qrPngBytes);
  const qrSize = 100;
  const qrX = width - 90 - qrSize;
  const qrY = 110;
  page.drawRectangle({ x: qrX - 8, y: qrY - 8, width: qrSize + 16, height: qrSize + 16, color: rgb(1, 1, 1) });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  page.drawText(cert.validation_code, {
    x: qrX + (qrSize - helvBold.widthOfTextAtSize(cert.validation_code, 9)) / 2,
    y: qrY - 22,
    size: 9,
    font: helvBold,
    color: rgb(1, 1, 1),
  });
  const verifyLabel = `Emitido em ${issuedAt}`;
  page.drawText(verifyLabel, {
    x: qrX + (qrSize - helv.widthOfTextAtSize(verifyLabel, 7)) / 2,
    y: qrY - 34,
    size: 7,
    font: helv,
    color: rgb(0.6, 0.65, 0.85),
  });

  // Legal footer at bottom
  const footerLines = wrapText(legalFooter, helvOblique, 8, width - 120);
  let fy = 70;
  for (const line of footerLines.slice(0, 3)) {
    page.drawText(line, {
      x: (width - helvOblique.widthOfTextAtSize(line, 8)) / 2,
      y: fy,
      size: 8,
      font: helvOblique,
      color: rgb(0.65, 0.7, 0.85),
    });
    fy -= 10;
  }

  const pdfBytes = await pdf.save();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const path = `${userId}/${cert.id}.pdf`;
  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
  if (upErr) throw new Error(`Falha no upload: ${upErr.message}`);

  const { error: updErr } = await supabaseAdmin
    .from("certificates")
    .update({ pdf_url: path, verification_url: validateUrl })
    .eq("id", cert.id);
  if (updErr) throw new Error(updErr.message);

  return { path, alreadyExists: false };
}

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
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

export const generateCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: GenerateInput) => {
    if (!data?.certificateId || typeof data.certificateId !== "string") {
      throw new Error("certificateId obrigatório");
    }
    return data;
  })
  .handler(async ({ data, context }) =>
    generateCertificateInternal(context.supabase, context.userId, data.certificateId)
  );

export const ensureCertificateForCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { courseId: string }) => {
    if (!data?.courseId) throw new Error("courseId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cert, error } = await supabase
      .from("certificates")
      .select("id, pdf_url")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!cert) return { certificateId: null as string | null, pdfPath: null };
    if (!cert.pdf_url) {
      const res = await generateCertificateInternal(supabase, userId, cert.id);
      return { certificateId: cert.id, pdfPath: res.path };
    }
    return { certificateId: cert.id, pdfPath: cert.pdf_url };
  });
