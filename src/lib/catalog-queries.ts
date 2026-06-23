import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TrackRow = {
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
};

export type CourseRow = {
  id: string;
  track_id: string;
  slug: string;
  title: string;
  description: string;
  duration_minutes: number;
  level: string;
  cover_url: string | null;
  sort_order: number;
};

export const tracksQuery = queryOptions({
  queryKey: ["tracks"],
  queryFn: async (): Promise<TrackRow[]> => {
    const { data, error } = await supabase
      .from("tracks")
      .select("id, slug, title, description, tag, level, hours, modules, icon, outcomes, sort_order")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as TrackRow[];
  },
  staleTime: 60_000,
});

export const coursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: async (): Promise<CourseRow[]> => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, track_id, slug, title, description, duration_minutes, level, cover_url, sort_order")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as CourseRow[];
  },
  staleTime: 60_000,
});

export function trackBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["track", slug],
    queryFn: async () => {
      const { data: track, error } = await supabase
        .from("tracks")
        .select("id, slug, title, description, tag, level, hours, modules, icon, outcomes, sort_order")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!track) return null;
      const { data: courses, error: cErr } = await supabase
        .from("courses")
        .select("id, track_id, slug, title, description, duration_minutes, level, cover_url, sort_order")
        .eq("track_id", track.id)
        .eq("is_published", true)
        .order("sort_order");
      if (cErr) throw cErr;
      return { track: track as TrackRow, courses: (courses ?? []) as CourseRow[] };
    },
    staleTime: 60_000,
  });
}
