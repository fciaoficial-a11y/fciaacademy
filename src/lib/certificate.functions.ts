import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type GenerateInput = { certificateId: string };

const BUCKET = "certificates";

async function generateCertificateInternal(
  supabase: SupabaseClient,
  userId: string,
  certificateId: string
) {
  const data = { certificateId };


    // Carrega o certificado do usuário (RLS garante ownership)
    const { data: cert, error: cErr } = await supabase
      .from("certificates")
      .select(
        "id, user_id, course_id, validation_code, pdf_url, issued_at, courses(title, workload_hours, tracks(title))"
      )
      .eq("id", data.certificateId)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!cert) throw new Error("Certificado não encontrado");
    if (cert.user_id !== userId) throw new Error("Forbidden");

    // Idempotente: se já existe, retorna
    if (cert.pdf_url) {
      return { path: cert.pdf_url, alreadyExists: true };
    }

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

    const studentName = profile?.full_name || "Aluno FCIA";
    const courseTitle = course?.title || "Curso FCIA";
    const trackTitle = track?.title || "FCIA Academy";
    const workload = Number(course?.workload_hours ?? 0);
    const issuedAt = new Date(cert.issued_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Origem para o QR
    const originHeader =
      // @ts-ignore — Web APIs available on the worker
      (typeof globalThis !== "undefined" &&
        (globalThis as any).LOVABLE_PUBLIC_ORIGIN) ||
      process.env.PUBLIC_APP_ORIGIN ||
      "";
    const origin = originHeader || "https://fcia-academy.lovable.app";
    const validateUrl = `${origin}/validar-certificado/${cert.validation_code}`;

    // Gera QR code em PNG (base64)
    const QRCode = (await import("qrcode")).default;
    const qrDataUrl = await QRCode.toDataURL(validateUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: "#0b0f1e", light: "#ffffff" },
    });
    const qrPngBytes = Uint8Array.from(
      atob(qrDataUrl.split(",")[1]),
      (c) => c.charCodeAt(0)
    );

    // Gera PDF A4 landscape com pdf-lib
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]); // A4 landscape (pt)
    const { width, height } = page.getSize();

    const helv = await pdf.embedFont(StandardFonts.Helvetica);
    const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

    // Fundo dark premium
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.043, 0.063, 0.118), // #0B1020
    });
    // Blobs decorativos
    page.drawEllipse({
      x: 90,
      y: height - 60,
      xScale: 180,
      yScale: 180,
      color: rgb(0.235, 0.361, 1), // primary
      opacity: 0.14,
    });
    page.drawEllipse({
      x: width - 90,
      y: 60,
      xScale: 200,
      yScale: 200,
      color: rgb(0.655, 0.545, 1), // accent
      opacity: 0.14,
    });

    // Borda dupla
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

    // Header
    page.drawText("FCIA ACADEMY", {
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

    // Título
    const title = "Certificado de Conclusão";
    const titleSize = 32;
    page.drawText(title, {
      x: (width - helvBold.widthOfTextAtSize(title, titleSize)) / 2,
      y: height - 150,
      size: titleSize,
      font: helvBold,
      color: rgb(1, 1, 1),
    });

    const sub = "Certificamos que";
    page.drawText(sub, {
      x: (width - helv.widthOfTextAtSize(sub, 12)) / 2,
      y: height - 190,
      size: 12,
      font: helv,
      color: rgb(0.75, 0.8, 0.95),
    });

    // Nome do aluno
    const nameSize = 30;
    page.drawText(studentName, {
      x: (width - helvBold.widthOfTextAtSize(studentName, nameSize)) / 2,
      y: height - 235,
      size: nameSize,
      font: helvBold,
      color: rgb(0.63, 0.78, 1),
    });

    const bodyLine = "concluiu com aproveitamento o curso";
    page.drawText(bodyLine, {
      x: (width - helv.widthOfTextAtSize(bodyLine, 12)) / 2,
      y: height - 275,
      size: 12,
      font: helv,
      color: rgb(0.75, 0.8, 0.95),
    });

    const courseSize = 20;
    page.drawText(courseTitle, {
      x: (width - helvBold.widthOfTextAtSize(courseTitle, courseSize)) / 2,
      y: height - 310,
      size: courseSize,
      font: helvBold,
      color: rgb(1, 1, 1),
    });

    // Meta (trilha, carga horária, data)
    const workloadText = workload > 0 ? `${workload}h` : "—";
    const meta = `Trilha: ${trackTitle}   ·   Carga horária: ${workloadText}   ·   Emitido em ${issuedAt}`;
    page.drawText(meta, {
      x: (width - helv.widthOfTextAtSize(meta, 11)) / 2,
      y: height - 345,
      size: 11,
      font: helv,
      color: rgb(0.7, 0.75, 0.9),
    });

    // Assinatura à esquerda
    const sigX = 90;
    const sigY = 140;
    page.drawLine({
      start: { x: sigX, y: sigY + 30 },
      end: { x: sigX + 260, y: sigY + 30 },
      color: rgb(0.5, 0.55, 0.85),
      thickness: 0.8,
    });
    page.drawText("Prof. Fernando Cabral", {
      x: sigX,
      y: sigY + 12,
      size: 12,
      font: helvBold,
      color: rgb(1, 1, 1),
    });
    page.drawText("CEO & Founder — FCIA", {
      x: sigX,
      y: sigY - 4,
      size: 10,
      font: helvOblique,
      color: rgb(0.75, 0.8, 0.95),
    });

    // QR + código à direita
    const qrImage = await pdf.embedPng(qrPngBytes);
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

    const codeLabel = "Código de validação";
    page.drawText(codeLabel, {
      x: qrX + qrSize + 16 - helv.widthOfTextAtSize(codeLabel, 8),
      y: qrY + qrSize - 4,
      size: 8,
      font: helv,
      color: rgb(0.7, 0.75, 0.9),
    });
    // Código embaixo do QR
    const codeText = cert.validation_code;
    page.drawText(codeText, {
      x: qrX + (qrSize - helvBold.widthOfTextAtSize(codeText, 9)) / 2,
      y: qrY - 22,
      size: 9,
      font: helvBold,
      color: rgb(1, 1, 1),
    });
    const verify = `Valide em ${origin.replace(/^https?:\/\//, "")}/validar-certificado`;
    page.drawText(verify, {
      x: qrX + (qrSize - helv.widthOfTextAtSize(verify, 7)) / 2,
      y: qrY - 34,
      size: 7,
      font: helv,
      color: rgb(0.6, 0.65, 0.85),
    });

    const pdfBytes = await pdf.save();

    // Upload via admin
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `${userId}/${cert.id}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) throw new Error(`Falha no upload: ${upErr.message}`);

    const { error: updErr } = await supabaseAdmin
      .from("certificates")
      .update({ pdf_url: path })
      .eq("id", cert.id);
    if (updErr) throw new Error(updErr.message);

    return { path, alreadyExists: false };
  });

/**
 * Server fn idempotente que garante um certificado gerado para (user, course).
 * Usada logo após a aprovação do quiz.
 */
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
      const res = await generateCertificate({ data: { certificateId: cert.id } });
      return { certificateId: cert.id, pdfPath: res.path };
    }
    return { certificateId: cert.id, pdfPath: cert.pdf_url };
  });
