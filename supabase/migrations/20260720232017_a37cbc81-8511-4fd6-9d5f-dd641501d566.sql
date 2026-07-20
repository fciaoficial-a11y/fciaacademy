
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS intro_video_path text,
  ADD COLUMN IF NOT EXISTS intro_video_duration_seconds integer,
  ADD COLUMN IF NOT EXISTS intro_video_poster_path text;

CREATE OR REPLACE FUNCTION public.get_module_intro_video_path(_module_id uuid)
RETURNS TABLE(video_path text, poster_path text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_course uuid;
  v_published boolean;
  v_video text;
  v_poster text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  SELECT course_id, is_published, intro_video_path, intro_video_poster_path
    INTO v_course, v_published, v_video, v_poster
    FROM public.modules
   WHERE id = _module_id;
  IF v_course IS NULL OR v_published IS NOT TRUE THEN
    RAISE EXCEPTION 'module_unavailable';
  END IF;
  IF NOT (public.has_course_access(v_user, v_course) OR public.has_role(v_user, 'admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY SELECT v_video, v_poster;
END;
$function$;
