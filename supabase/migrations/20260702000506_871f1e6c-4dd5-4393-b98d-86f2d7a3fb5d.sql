
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS pdf_file_name TEXT,
  ADD COLUMN IF NOT EXISTS pdf_file_size BIGINT,
  ADD COLUMN IF NOT EXISTS pdf_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS pdf_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pdf_total_pages INTEGER;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS allow_pdf_download BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.get_module_pdf_path(_module_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_course UUID;
  v_path TEXT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  SELECT course_id, pdf_path INTO v_course, v_path
    FROM public.modules WHERE id = _module_id;
  IF v_course IS NULL THEN
    RAISE EXCEPTION 'module_not_found';
  END IF;
  IF NOT public.has_course_access(v_user, v_course) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN v_path;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_module_pdf_path(UUID) TO authenticated;
