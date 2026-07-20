
CREATE OR REPLACE FUNCTION public.enforce_quiz_unlocked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course uuid;
  v_elig RECORD;
BEGIN
  v_course := NEW.course_id;
  IF v_course IS NULL THEN
    SELECT course_id INTO v_course FROM public.modules WHERE id = NEW.module_id;
    NEW.course_id := v_course;
  END IF;
  IF v_course IS NULL THEN
    RAISE EXCEPTION 'course_required_for_attempt';
  END IF;

  -- Executa como o próprio usuário do attempt para respeitar sua elegibilidade
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'user_mismatch';
  END IF;

  SELECT * INTO v_elig FROM public.get_quiz_eligibility(v_course);
  IF NOT v_elig.quiz_unlocked THEN
    RAISE EXCEPTION 'quiz_locked: conclua todos os módulos do curso para liberar o quiz.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_quiz_unlocked ON public.quiz_attempts;
CREATE TRIGGER trg_enforce_quiz_unlocked
BEFORE INSERT ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.enforce_quiz_unlocked();
