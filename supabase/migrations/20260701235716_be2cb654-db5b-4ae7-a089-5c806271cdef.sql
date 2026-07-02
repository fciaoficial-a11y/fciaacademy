
DROP TRIGGER IF EXISTS trg_issue_certificate ON public.quiz_attempts;
DROP TRIGGER IF EXISTS trg_xp_certificate ON public.certificates;
DROP FUNCTION IF EXISTS public.validate_certificate(text);

CREATE TABLE IF NOT EXISTS public.certificate_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  institution_name TEXT NOT NULL DEFAULT 'FCIA Academy',
  legal_name TEXT NOT NULL DEFAULT 'FCIA Academy',
  cnpj TEXT,
  issuer_name TEXT NOT NULL DEFAULT 'Fernando Cabral',
  issuer_role TEXT NOT NULL DEFAULT 'CEO & Founder — FCIA',
  validation_base_url TEXT NOT NULL DEFAULT 'https://fciaacademy.lovable.app/validar-certificado',
  logo_url TEXT,
  signature_image_url TEXT,
  certificate_title TEXT NOT NULL DEFAULT 'Certificado de Conclusão',
  body_template TEXT NOT NULL DEFAULT 'A FCIA Academy certifica que {{student_name}} concluiu com aproveitamento o curso livre de capacitação e atualização profissional {{course_title}}, com carga horária total de {{workload_hours}} horas, concluído em {{completion_date}}.',
  legal_footer TEXT NOT NULL DEFAULT 'Curso livre de capacitação e atualização profissional, sem equivalência a diploma de curso técnico, graduação ou pós-graduação, e sem declaração de reconhecimento pelo MEC.',
  min_score NUMERIC(5,2) NOT NULL DEFAULT 70,
  auto_issue BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.certificate_settings TO authenticated;
GRANT ALL ON public.certificate_settings TO service_role;
ALTER TABLE public.certificate_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage certificate settings" ON public.certificate_settings;
CREATE POLICY "Admins manage certificate settings" ON public.certificate_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Authenticated read settings" ON public.certificate_settings;
CREATE POLICY "Authenticated read settings" ON public.certificate_settings
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.certificate_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS student_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS course_title_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS workload_hours_snapshot INTEGER,
  ADD COLUMN IF NOT EXISTS completion_date DATE,
  ADD COLUMN IF NOT EXISTS verification_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','revoked'));

UPDATE public.certificates c SET
  student_name_snapshot = COALESCE(c.student_name_snapshot, p.full_name, 'Aluno FCIA'),
  course_title_snapshot = COALESCE(c.course_title_snapshot, co.title),
  workload_hours_snapshot = COALESCE(c.workload_hours_snapshot, co.workload_hours),
  completion_date = COALESCE(c.completion_date, c.issued_at::date),
  verification_url = COALESCE(c.verification_url, 'https://fciaacademy.lovable.app/validar-certificado/' || c.validation_code),
  status = CASE WHEN c.revoked_at IS NOT NULL THEN 'revoked' ELSE 'issued' END
FROM public.profiles p, public.courses co
WHERE p.id = c.user_id AND co.id = c.course_id;

CREATE OR REPLACE FUNCTION public.issue_certificate_on_pass()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_settings RECORD; v_course RECORD; v_student TEXT; v_url_base TEXT;
BEGIN
  IF NEW.course_id IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO v_settings FROM public.certificate_settings WHERE id = 1;
  IF v_settings.auto_issue = false THEN RETURN NEW; END IF;
  IF NEW.score < COALESCE(v_settings.min_score, 70) THEN RETURN NEW; END IF;
  SELECT id, title, workload_hours, certificate_enabled INTO v_course
    FROM public.courses WHERE id = NEW.course_id;
  IF NOT FOUND OR v_course.certificate_enabled = false THEN RETURN NEW; END IF;
  SELECT COALESCE(full_name,'Aluno FCIA') INTO v_student FROM public.profiles WHERE id = NEW.user_id;
  v_url_base := COALESCE(v_settings.validation_base_url,'https://fciaacademy.lovable.app/validar-certificado');
  INSERT INTO public.certificates (
    user_id, course_id, student_name_snapshot, course_title_snapshot,
    workload_hours_snapshot, completion_date, status
  ) VALUES (
    NEW.user_id, NEW.course_id, COALESCE(v_student,'Aluno FCIA'),
    v_course.title, v_course.workload_hours, CURRENT_DATE, 'issued'
  ) ON CONFLICT (user_id, course_id) DO NOTHING;
  UPDATE public.certificates
     SET verification_url = v_url_base || '/' || validation_code
   WHERE user_id = NEW.user_id AND course_id = NEW.course_id AND verification_url IS NULL;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_certificate_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.revoked_at IS NOT NULL THEN NEW.status := 'revoked';
  ELSE NEW.status := COALESCE(NEW.status,'issued');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sync_certificate_status ON public.certificates;
CREATE TRIGGER trg_sync_certificate_status BEFORE INSERT OR UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.sync_certificate_status();

CREATE FUNCTION public.validate_certificate(_code text)
RETURNS TABLE (
  validation_code text, issued_at timestamptz, completion_date date,
  student_name text, course_title text, course_slug text, track_title text,
  workload_hours integer, status text, verification_url text,
  institution_name text, legal_footer text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.validation_code, c.issued_at, c.completion_date,
    COALESCE(c.student_name_snapshot, p.full_name, 'Aluno FCIA'),
    COALESCE(c.course_title_snapshot, co.title),
    co.slug, tr.title,
    COALESCE(c.workload_hours_snapshot, co.workload_hours),
    c.status, c.verification_url,
    s.institution_name, s.legal_footer
  FROM public.certificates c
  JOIN public.courses co ON co.id = c.course_id
  LEFT JOIN public.tracks tr ON tr.id = co.track_id
  LEFT JOIN public.profiles p ON p.id = c.user_id
  CROSS JOIN LATERAL (SELECT institution_name, legal_footer FROM public.certificate_settings WHERE id=1) s
  WHERE c.validation_code = upper(_code)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.validate_certificate(text) TO anon, authenticated;
