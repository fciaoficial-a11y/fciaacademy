
-- Extra profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro'));

-- Certificate revoke
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- Admin CRUD policies
DO $$ BEGIN
  -- TRACKS
  DROP POLICY IF EXISTS "Admins manage tracks" ON public.tracks;
  CREATE POLICY "Admins manage tracks" ON public.tracks FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

  -- COURSES
  DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
  CREATE POLICY "Admins manage courses" ON public.courses FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

  -- MODULES
  DROP POLICY IF EXISTS "Admins manage modules" ON public.modules;
  CREATE POLICY "Admins manage modules" ON public.modules FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

  -- QUESTIONS
  DROP POLICY IF EXISTS "Admins manage questions" ON public.questions;
  CREATE POLICY "Admins manage questions" ON public.questions FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

  -- CERTIFICATES (admin read/update/delete)
  DROP POLICY IF EXISTS "Admins manage certificates" ON public.certificates;
  CREATE POLICY "Admins manage certificates" ON public.certificates FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

  -- PROFILES (admin can read & update all)
  DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
  CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(),'admin'));
  DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
  CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

  -- USER_ROLES (admin manages)
  DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
  CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
END $$;

-- Admin: list users with email
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id UUID, email TEXT, full_name TEXT, avatar_url TEXT,
  status TEXT, plan TEXT, xp INTEGER, level TEXT, streak INTEGER,
  role TEXT, created_at TIMESTAMPTZ, certificates_count BIGINT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
    SELECT p.id, u.email::TEXT, p.full_name, p.avatar_url, p.status, p.plan,
           p.xp, p.level, p.streak,
           COALESCE((SELECT r.role::TEXT FROM public.user_roles r WHERE r.user_id = p.id LIMIT 1), 'aluno'),
           p.created_at,
           (SELECT COUNT(*) FROM public.certificates c WHERE c.user_id = p.id)
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- Admin: metrics
CREATE OR REPLACE FUNCTION public.admin_metrics()
RETURNS TABLE(
  total_students BIGINT,
  active_courses BIGINT,
  certificates_issued BIGINT,
  courses_completed BIGINT,
  approval_rate NUMERIC
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_attempts BIGINT;
  v_passed BIGINT;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  SELECT COUNT(*) INTO v_attempts FROM public.quiz_attempts;
  SELECT COUNT(*) INTO v_passed FROM public.quiz_attempts WHERE passed = true;
  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM public.profiles)::BIGINT,
    (SELECT COUNT(*) FROM public.courses WHERE is_published)::BIGINT,
    (SELECT COUNT(*) FROM public.certificates WHERE revoked_at IS NULL)::BIGINT,
    (SELECT COUNT(DISTINCT (user_id, course_id)) FROM public.certificates WHERE revoked_at IS NULL)::BIGINT,
    CASE WHEN v_attempts = 0 THEN 0
         ELSE ROUND((v_passed::NUMERIC / v_attempts::NUMERIC) * 100, 1)
    END;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_metrics() TO authenticated;
