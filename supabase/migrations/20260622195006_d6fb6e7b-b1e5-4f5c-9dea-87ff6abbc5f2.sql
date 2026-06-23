
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  validation_code TEXT NOT NULL UNIQUE DEFAULT upper(replace(gen_random_uuid()::text, '-', '')),
  pdf_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_certificates_code ON public.certificates(validation_code);

GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own certificates"
  ON public.certificates FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Auto-issue certificate when a quiz attempt passes
CREATE OR REPLACE FUNCTION public.issue_certificate_on_pass()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.passed = true AND NEW.course_id IS NOT NULL THEN
    INSERT INTO public.certificates (user_id, course_id)
    VALUES (NEW.user_id, NEW.course_id)
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_issue_certificate
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.issue_certificate_on_pass();

-- Public validation function (anon can call by code only)
CREATE OR REPLACE FUNCTION public.validate_certificate(_code TEXT)
RETURNS TABLE (
  validation_code TEXT,
  issued_at TIMESTAMPTZ,
  student_name TEXT,
  course_title TEXT,
  course_slug TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.validation_code,
    c.issued_at,
    COALESCE(p.full_name, 'Aluno FCIA') AS student_name,
    co.title AS course_title,
    co.slug AS course_slug
  FROM public.certificates c
  JOIN public.courses co ON co.id = c.course_id
  LEFT JOIN public.profiles p ON p.id = c.user_id
  WHERE c.validation_code = upper(_code)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.validate_certificate(TEXT) TO anon, authenticated;

-- Backfill: emit certificates for users who already passed quizzes
INSERT INTO public.certificates (user_id, course_id)
SELECT DISTINCT qa.user_id, qa.course_id
FROM public.quiz_attempts qa
WHERE qa.passed = true AND qa.course_id IS NOT NULL
ON CONFLICT (user_id, course_id) DO NOTHING;
