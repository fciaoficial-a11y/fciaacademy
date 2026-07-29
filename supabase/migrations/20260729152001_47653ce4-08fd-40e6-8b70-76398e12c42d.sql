CREATE OR REPLACE FUNCTION public.has_course_access(_user uuid, _course uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = _course
      AND c.is_published = true
      AND (
        -- Curso realmente gratuito: acesso livre para autenticados
        (COALESCE(c.is_free, false) = true OR COALESCE(c.price, 0) = 0)
        -- Curso pago: exige enrollment do próprio usuário
        OR EXISTS (
          SELECT 1 FROM public.enrollments e
           WHERE e.user_id = _user AND e.course_id = _course
        )
        -- Admin sempre passa
        OR public.has_role(_user, 'admin')
      )
  );
$function$;