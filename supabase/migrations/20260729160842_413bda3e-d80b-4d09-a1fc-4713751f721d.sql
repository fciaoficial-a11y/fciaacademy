CREATE OR REPLACE FUNCTION public.has_course_access(_user uuid, _course uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_published boolean;
  v_is_free boolean;
  v_price numeric;
BEGIN
  IF _user IS NULL OR _course IS NULL THEN
    RETURN false;
  END IF;

  -- Admin sempre passa
  IF public.has_role(_user, 'admin'::public.app_role) THEN
    RETURN true;
  END IF;

  SELECT c.is_published, COALESCE(c.is_free, false), COALESCE(c.price, 0)
    INTO v_is_published, v_is_free, v_price
    FROM public.courses c
   WHERE c.id = _course;

  IF NOT FOUND OR v_is_published IS NOT TRUE THEN
    RETURN false;
  END IF;

  -- Curso realmente gratuito
  IF v_is_free = true OR v_price = 0 THEN
    RETURN true;
  END IF;

  -- Curso pago: exige enrollment do próprio usuário
  RETURN EXISTS (
    SELECT 1
      FROM public.enrollments e
     WHERE e.user_id = _user
       AND e.course_id = _course
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_course_access(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_course_access(uuid, uuid) TO authenticated, service_role;