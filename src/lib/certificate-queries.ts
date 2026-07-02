import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CertificateRow = {
  id: string;
  course_id: string;
  validation_code: string;
  pdf_url: string | null;
  issued_at: string;
  completion_date: string | null;
  student_name_snapshot: string | null;
  course_title_snapshot: string | null;
  workload_hours_snapshot: number | null;
  verification_url: string | null;
  status: string;
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
          "id, course_id, validation_code, pdf_url, issued_at, completion_date, student_name_snapshot, course_title_snapshot, workload_hours_snapshot, verification_url, status, courses(title, slug, description)"
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
  completion_date: string | null;
  student_name: string;
  course_title: string;
  course_slug: string;
  track_title: string | null;
  workload_hours: number | null;
  status: string;
  verification_url: string | null;
  institution_name: string;
  legal_footer: string;
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
