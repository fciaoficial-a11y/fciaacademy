import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as unknown as {
  from: (t: string) => any;
  rpc: (n: string, args?: Record<string, unknown>) => any;
  storage: any;
  auth: any;
};

/* ------------ role check ------------ */
export const isAdminQuery = queryOptions({
  queryKey: ["is-admin"],
  queryFn: async (): Promise<boolean> => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return false;
    const { data, error } = await sb.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (error) return false;
    return !!data;
  },
  staleTime: 60_000,
});

/* ------------ metrics ------------ */
export interface AdminMetrics {
  total_students: number;
  active_courses: number;
  certificates_issued: number;
  courses_completed: number;
  approval_rate: number;
}
export const adminMetricsQuery = queryOptions({
  queryKey: ["admin", "metrics"],
  queryFn: async (): Promise<AdminMetrics> => {
    const { data, error } = await sb.rpc("admin_metrics");
    if (error) throw error;
    return (data?.[0] ?? {
      total_students: 0,
      active_courses: 0,
      certificates_issued: 0,
      courses_completed: 0,
      approval_rate: 0,
    }) as AdminMetrics;
  },
});

/* ------------ tracks ------------ */
export interface AdminTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  tag: string;
  level: string;
  hours: string;
  modules: number;
  icon: string;
  outcomes: string[];
  sort_order: number;
  is_published: boolean;
}
export const adminTracksQuery = queryOptions({
  queryKey: ["admin", "tracks"],
  queryFn: async (): Promise<AdminTrack[]> => {
    const { data, error } = await sb.from("tracks").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as AdminTrack[];
  },
});

/* ------------ courses ------------ */
export interface AdminCourse {
  id: string;
  track_id: string;
  slug: string;
  title: string;
  description: string;
  duration_minutes: number;
  level: string;
  cover_url: string | null;
  sort_order: number;
  is_published: boolean;
}
export const adminCoursesQuery = queryOptions({
  queryKey: ["admin", "courses"],
  queryFn: async (): Promise<AdminCourse[]> => {
    const { data, error } = await sb.from("courses").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as AdminCourse[];
  },
});

/* ------------ modules ------------ */
export interface AdminModule {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string;
  content_type: string;
  content_url: string | null;
  content_text: string | null;
  duration_minutes: number;
  sort_order: number;
  is_published: boolean;
}
export const adminModulesQuery = queryOptions({
  queryKey: ["admin", "modules"],
  queryFn: async (): Promise<AdminModule[]> => {
    const { data, error } = await sb.from("modules").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as AdminModule[];
  },
});

/* ------------ questions ------------ */
export interface AdminQuestion {
  id: string;
  module_id: string;
  question: string;
  type: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  sort_order: number;
}
export const adminQuestionsQuery = queryOptions({
  queryKey: ["admin", "questions"],
  queryFn: async (): Promise<AdminQuestion[]> => {
    const { data, error } = await sb.from("questions").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as AdminQuestion[];
  },
});

/* ------------ certificates ------------ */
export interface AdminCertificate {
  id: string;
  user_id: string;
  course_id: string;
  validation_code: string;
  issued_at: string;
  revoked_at: string | null;
}
export const adminCertificatesQuery = queryOptions({
  queryKey: ["admin", "certificates"],
  queryFn: async (): Promise<AdminCertificate[]> => {
    const { data, error } = await sb
      .from("certificates")
      .select("*")
      .order("issued_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminCertificate[];
  },
});

/* ------------ users ------------ */
export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: string;
  plan: string;
  xp: number;
  level: string;
  streak: number;
  role: string;
  created_at: string;
  certificates_count: number;
}
export const adminUsersQuery = queryOptions({
  queryKey: ["admin", "users"],
  queryFn: async (): Promise<AdminUser[]> => {
    const { data, error } = await sb.rpc("admin_list_users");
    if (error) throw error;
    return (data ?? []) as AdminUser[];
  },
});

/* ------------ generic mutations ------------ */
export async function upsertRow(table: string, row: Record<string, unknown>) {
  const { error } = await sb.from(table).upsert(row);
  if (error) throw error;
}
export async function insertRow(table: string, row: Record<string, unknown>) {
  const { error } = await sb.from(table).insert(row);
  if (error) throw error;
}
export async function updateRow(table: string, id: string, patch: Record<string, unknown>) {
  const { error } = await sb.from(table).update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteRow(table: string, id: string) {
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) throw error;
}

/* ------------ storage upload ------------ */
export async function uploadCourseAsset(file: File, folder: "covers" | "pdfs") {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("course-assets").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = await sb.storage.from("course-assets").createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? path;
}
