import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  renderCertificatePdf,
  type RenderContext,
  type TemplateKey,
} from "./certificate-templates";

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

function normalizeTemplateKey(v: unknown): TemplateKey {
  if (
    v === "executive_tech" ||
    v === "dark_premium_tech" ||
    v === "editorial_prestige"
  ) {
    return v;
  }
  return "dark_premium_tech";
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
    "Curso livre de capacitação profissional, nos termos da Lei nº 9.394/1996 e do Decreto nº 5.154/2004.";
  const issuerName = settings?.issuer_name || "Prof. Fernando Cabral";
  const issuerRole = settings?.issuer_role || "CEO & Founder — FCIA";
  const validationBase =
    settings?.validation_base_url ||
    "https://fciaacademy.lovable.app/validar-certificado";
  const templateKey = normalizeTemplateKey(settings?.template_key);

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

  const ctx: RenderContext = {
    studentName,
    courseTitle,
    workloadHours: workload,
    completionDate: completionStr,
    issuedDate: issuedAt,
    validationCode: cert.validation_code,
    verificationUrl: validateUrl,
    institutionName,
    trackTitle,
    certificateTitle,
    bodyText,
    legalFooter,
    issuerName,
    issuerRole,
    qrPng: qrPngBytes,
  };

  const pdfBytes = await renderCertificatePdf(templateKey, ctx);

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

/**
 * Regenerates a certificate PDF for the currently authenticated user by
 * clearing pdf_url and letting the standard renderer run again with the
 * currently configured template. Useful for admins previewing template
 * changes with their own emitted certificates.
 */
export const regenerateCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: GenerateInput) => {
    if (!data?.certificateId) throw new Error("certificateId obrigatório");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cert, error } = await supabase
      .from("certificates")
      .select("id, user_id")
      .eq("id", data.certificateId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!cert || cert.user_id !== userId) throw new Error("Forbidden");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    await supabaseAdmin
      .from("certificates")
      .update({ pdf_url: null })
      .eq("id", data.certificateId);
    return generateCertificateInternal(
      supabase,
      userId,
      data.certificateId
    );
  });
