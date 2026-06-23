import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CertificateRow = {
  id: string;
  course_id: string;
  validation_code: string;
  pdf_url: string | null;
  issued_at: string;
  courses: { title: string; slug: string; description: string } | null;
};

export function myCertificatesQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["certificates", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<CertificateRow[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("certificates")
        .select(
          "id, course_id, validation_code, pdf_url, issued_at, courses(title, slug, description)"
        )
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((c: any) => ({
        ...c,
        courses: Array.isArray(c.courses) ? c.courses[0] : c.courses,
      })) as CertificateRow[];
    },
    staleTime: 10_000,
  });
}

export type PublicCertificate = {
  validation_code: string;
  issued_at: string;
  student_name: string;
  course_title: string;
  course_slug: string;
};

export function validateCertificateQuery(code: string) {
  return queryOptions({
    queryKey: ["validate-certificate", code],
    queryFn: async (): Promise<PublicCertificate | null> => {
      const { data, error } = await supabase.rpc("validate_certificate", {
        _code: code,
      });
      if (error) throw error;
      const rows = (data ?? []) as PublicCertificate[];
      return rows[0] ?? null;
    },
    staleTime: 60_000,
  });
}
