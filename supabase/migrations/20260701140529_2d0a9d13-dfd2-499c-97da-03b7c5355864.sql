-- 1) Table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE SET NULL,
  plan_at_enrollment TEXT NOT NULL DEFAULT 'free',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);

-- 2) Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;

-- 3) RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own enrollments" ON public.enrollments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users create own enrollments" ON public.enrollments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own enrollments" ON public.enrollments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage enrollments" ON public.enrollments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 4) updated_at trigger
CREATE TRIGGER trg_enrollments_updated
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) RPC: enroll_in_course (idempotente + gate por plano)
CREATE OR REPLACE FUNCTION public.enroll_in_course(_course_id UUID)
RETURNS public.enrollments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_course RECORD;
  v_plan TEXT;
  v_required TEXT;
  v_enrollment public.enrollments;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT c.id, c.track_id, t.required_plan
    INTO v_course
    FROM public.courses c
    LEFT JOIN public.tracks t ON t.id = c.track_id
    WHERE c.id = _course_id AND c.is_published = true;

  IF v_course.id IS NULL THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  v_plan := public.current_plan(v_user);
  v_required := COALESCE(v_course.required_plan, 'free');

  IF public.plan_rank(v_plan) < public.plan_rank(v_required) THEN
    RAISE EXCEPTION 'plan_required:%', v_required;
  END IF;

  INSERT INTO public.enrollments (user_id, course_id, track_id, plan_at_enrollment)
  VALUES (v_user, _course_id, v_course.track_id, v_plan)
  ON CONFLICT (user_id, course_id)
    DO UPDATE SET last_accessed_at = now(), updated_at = now()
  RETURNING * INTO v_enrollment;

  RETURN v_enrollment;
END;
$$;

GRANT EXECUTE ON FUNCTION public.enroll_in_course(UUID) TO authenticated;
