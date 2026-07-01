
CREATE OR REPLACE FUNCTION public.enroll_in_course(_course_id uuid)
 RETURNS enrollments
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  SELECT c.id, c.track_id, c.price, t.required_plan
    INTO v_course
    FROM public.courses c
    LEFT JOIN public.tracks t ON t.id = c.track_id
    WHERE c.id = _course_id AND c.is_published = true;

  IF v_course.id IS NULL THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  -- Cursos pagos (compra avulsa) só podem ser matriculados pelo webhook de pagamento
  IF COALESCE(v_course.price, 0) > 0 THEN
    RAISE EXCEPTION 'purchase_required';
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
$function$;

-- Limpa enrollment fantasma do curso de teste (criado antes do gate por preço)
DELETE FROM public.enrollments
WHERE course_id = '6dcc55c2-8a98-4cde-a750-eba06c214c35'
  AND plan_at_enrollment <> 'course_purchase';
