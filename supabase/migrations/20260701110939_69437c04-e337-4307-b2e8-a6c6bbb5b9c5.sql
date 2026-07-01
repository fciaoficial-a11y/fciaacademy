
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS workload_hours integer NOT NULL DEFAULT 0;

DROP FUNCTION IF EXISTS public.validate_certificate(text);

CREATE FUNCTION public.validate_certificate(_code text)
 RETURNS TABLE(validation_code text, issued_at timestamp with time zone, student_name text, course_title text, course_slug text, track_title text, workload_hours integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    c.validation_code,
    c.issued_at,
    COALESCE(p.full_name, 'Aluno FCIA') AS student_name,
    co.title AS course_title,
    co.slug AS course_slug,
    tr.title AS track_title,
    co.workload_hours
  FROM public.certificates c
  JOIN public.courses co ON co.id = c.course_id
  LEFT JOIN public.tracks tr ON tr.id = co.track_id
  LEFT JOIN public.profiles p ON p.id = c.user_id
  WHERE c.validation_code = upper(_code)
  LIMIT 1;
$function$;

GRANT EXECUTE ON FUNCTION public.validate_certificate(text) TO anon, authenticated;

-- Storage policies for the private certificates bucket (bucket criado via tool)
DROP POLICY IF EXISTS "Users read own certificates" ON storage.objects;
CREATE POLICY "Users read own certificates"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'certificates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
