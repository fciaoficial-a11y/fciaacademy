
-- Quiz gating: require all published modules completed before allowing quiz.

-- 1) Elegibilidade do quiz por curso
CREATE OR REPLACE FUNCTION public.get_quiz_eligibility(_course_id uuid)
RETURNS TABLE (
  enrolled boolean,
  total_required_modules integer,
  completed_required_modules integer,
  completion_percent integer,
  quiz_unlocked boolean,
  block_reason text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_enrolled boolean := false;
  v_total int := 0;
  v_done int := 0;
  v_access boolean := false;
BEGIN
  IF v_user IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 0, false, 'not_authenticated'::text;
    RETURN;
  END IF;

  v_access := public.has_course_access(v_user, _course_id);
  v_enrolled := EXISTS (
    SELECT 1 FROM public.enrollments WHERE user_id = v_user AND course_id = _course_id
  ) OR v_access;

  IF NOT v_access THEN
    RETURN QUERY SELECT v_enrolled, 0, 0, 0, false, 'no_access'::text;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_total
    FROM public.modules
   WHERE course_id = _course_id AND is_published = true;

  IF v_total = 0 THEN
    RETURN QUERY SELECT v_enrolled, 0, 0, 0, false, 'no_modules_configured'::text;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_done
    FROM public.module_progress mp
    JOIN public.modules m ON m.id = mp.module_id
   WHERE mp.user_id = v_user
     AND mp.course_id = _course_id
     AND mp.completed = true
     AND m.is_published = true;

  RETURN QUERY SELECT
    v_enrolled,
    v_total,
    v_done,
    CASE WHEN v_total = 0 THEN 0 ELSE ROUND((v_done::numeric / v_total::numeric) * 100)::int END,
    (v_done >= v_total),
    CASE WHEN v_done >= v_total THEN NULL ELSE 'modules_pending' END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_eligibility(uuid) TO authenticated;

-- 2) Marcar módulo como concluído com validação de acesso
CREATE OR REPLACE FUNCTION public.mark_module_complete(_module_id uuid)
RETURNS TABLE (
  total_modules integer,
  completed_modules integer,
  completion_percent integer,
  quiz_unlocked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_course uuid;
  v_published boolean;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT course_id, is_published INTO v_course, v_published
    FROM public.modules WHERE id = _module_id;

  IF v_course IS NULL OR v_published IS NOT TRUE THEN
    RAISE EXCEPTION 'module_unavailable';
  END IF;

  IF NOT public.has_course_access(v_user, v_course) THEN
    RAISE EXCEPTION 'no_access';
  END IF;

  INSERT INTO public.module_progress (user_id, module_id, course_id, completed, completed_at)
  VALUES (v_user, _module_id, v_course, true, now())
  ON CONFLICT (user_id, module_id)
    DO UPDATE SET completed = true,
                  completed_at = COALESCE(public.module_progress.completed_at, now()),
                  updated_at = now();

  RETURN QUERY
    SELECT e.total_required_modules,
           e.completed_required_modules,
           e.completion_percent,
           e.quiz_unlocked
      FROM public.get_quiz_eligibility(v_course) e;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_module_complete(uuid) TO authenticated;

-- 3) Endurecer assemble_exam para bloquear se módulos pendentes
CREATE OR REPLACE FUNCTION public.assemble_exam(_course_id uuid, _size integer DEFAULT 10)
RETURNS SETOF public.questions
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_last_ids UUID[];
  v_elig RECORD;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF NOT public.has_course_access(v_user, _course_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO v_elig FROM public.get_quiz_eligibility(_course_id);
  IF NOT v_elig.quiz_unlocked THEN
    RAISE EXCEPTION 'quiz_locked: conclua todos os módulos do curso para liberar o quiz.';
  END IF;

  SELECT COALESCE(
    (SELECT ARRAY(SELECT (a->>'question_id')::UUID
                    FROM jsonb_array_elements(answers) a)
       FROM public.quiz_attempts
      WHERE user_id = v_user AND course_id = _course_id
      ORDER BY created_at DESC LIMIT 1),
    ARRAY[]::UUID[]
  ) INTO v_last_ids;

  RETURN QUERY
  WITH pool AS (
    SELECT * FROM public.questions
     WHERE course_id = _course_id AND status = 'approved'
  ),
  fresh AS (
    SELECT * FROM pool WHERE NOT (id = ANY(v_last_ids))
     ORDER BY random() LIMIT _size
  ),
  filler AS (
    SELECT * FROM pool
     WHERE id = ANY(v_last_ids)
       AND id NOT IN (SELECT id FROM fresh)
     ORDER BY random()
     LIMIT GREATEST(_size - (SELECT COUNT(*) FROM fresh), 0)
  )
  SELECT * FROM fresh
  UNION ALL
  SELECT * FROM filler;
END;
$$;
