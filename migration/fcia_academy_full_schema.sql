-- FCIA Academy — Full Schema DDL
-- Generated from supabase/migrations/*.sql
-- Target: empty Supabase project (awimyyqqnnohoixiqxwf)
-- DDL only — no DML


-- ============================================================
-- Source: 20260622190205_4b71290e-dde7-441a-be98-0da32a7b9b29.sql
-- ============================================================


-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- Source: 20260622190218_7f3b862f-c01b-4f33-997a-2a80e6591dfe.sql
-- ============================================================


REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;


-- ============================================================
-- Source: 20260622192020_784b644d-9e09-47d8-ac41-6fed8b85a3f5.sql
-- ============================================================


-- ============== ROLES ==============
CREATE TYPE public.app_role AS ENUM ('admin', 'aluno');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Default aluno role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- ============== TRACKS ==============
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tag TEXT NOT NULL,
  level TEXT NOT NULL,
  hours TEXT NOT NULL,
  modules INT NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  outcomes TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tracks TO anon, authenticated;
GRANT ALL ON public.tracks TO service_role;

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published tracks" ON public.tracks
  FOR SELECT TO anon, authenticated
  USING (is_published OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage tracks" ON public.tracks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============== COURSES ==============
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Iniciante',
  cover_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_track_id ON public.courses(track_id);
CREATE INDEX idx_courses_published ON public.courses(is_published);

GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published courses" ON public.courses
  FOR SELECT TO anon, authenticated
  USING (is_published OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage courses" ON public.courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_tracks_updated BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== STORAGE: avatars ==============
CREATE POLICY "Avatars readable by authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);-- [DML removido] INSERT INTO public.tracks (slug, title, description, tag, level, hours, modules, icon, out
-- [DML removido] WITH t AS (SELECT id, slug FROM public.tracks)



-- ============================================================
-- Source: 20260622192040_f1828d16-eb44-42ec-b1f9-8e425ad95607.sql
-- ============================================================


REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;


-- ============================================================
-- Source: 20260622192832_61e6b80f-4a40-4b23-b035-553216b1a2ee.sql
-- ============================================================


CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'video' CHECK (content_type IN ('video','pdf','text')),
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, slug)
);
CREATE INDEX idx_modules_course ON public.modules(course_id);

GRANT SELECT ON public.modules TO anon, authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published modules" ON public.modules
  FOR SELECT TO anon, authenticated
  USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage modules" ON public.modules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_modules_updated_at BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);
CREATE INDEX idx_progress_user_course ON public.module_progress(user_id, course_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_progress TO authenticated;
GRANT ALL ON public.module_progress TO service_role;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress" ON public.module_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_module_progress_updated_at BEFORE UPDATE ON public.module_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- Source: 20260622194625_4834ef31-214b-45ec-b95d-c27281255ea7.sql
-- ============================================================


-- Questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice','true_false')),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_module ON public.questions(module_id);

GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view questions"
  ON public.questions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage questions"
  ON public.questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  passed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user_module ON public.quiz_attempts(user_id, module_id);

GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own attempts"
  ON public.quiz_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own attempts"
  ON public.quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);-- [DML removido] INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanat
-- [DML removido] INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanat
-- [DML removido] INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanat



-- ============================================================
-- Source: 20260622195006_d6fb6e7b-b1e5-4f5c-9dea-87ff6abbc5f2.sql
-- ============================================================


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

GRANT EXECUTE ON FUNCTION public.validate_certificate(TEXT) TO anon, authenticated;-- [DML removido] INSERT INTO public.certificates (user_id, course_id)



-- ============================================================
-- Source: 20260622203327_25bbbb14-4a7f-4ff4-a6e1-0a7d8d2556e4.sql
-- ============================================================


-- Profiles gamification columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Iniciante',
  ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Achievements catalog
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Trophy',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements readable by authenticated"
  ON public.achievements FOR SELECT TO authenticated USING (true);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User reads own achievements"
  ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- XP log
CREATE TABLE IF NOT EXISTS public.xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.xp_log TO authenticated;
GRANT ALL ON public.xp_log TO service_role;
ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User reads own xp log"
  ON public.xp_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_user_created ON public.xp_log(user_id, created_at DESC);

-- Level computation
CREATE OR REPLACE FUNCTION public.compute_level(_xp INTEGER)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN _xp >= 2500 THEN 'Mestre FCIA'
    WHEN _xp >= 1000 THEN 'Especialista'
    WHEN _xp >= 500 THEN 'Praticante'
    WHEN _xp >= 200 THEN 'Explorador'
    ELSE 'Iniciante'
  END
$$;

-- Auto-update level on xp change
CREATE OR REPLACE FUNCTION public.sync_profile_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.level := public.compute_level(NEW.xp);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sync_profile_level ON public.profiles;
CREATE TRIGGER trg_sync_profile_level
  BEFORE INSERT OR UPDATE OF xp ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_level();

-- Award XP helper
CREATE OR REPLACE FUNCTION public.award_xp(_user UUID, _amount INTEGER, _reason TEXT, _ref UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _amount = 0 THEN RETURN; END IF;
  INSERT INTO public.xp_log (user_id, amount, reason, reference_id)
  VALUES (_user, _amount, _reason, _ref);
  UPDATE public.profiles SET xp = xp + _amount, updated_at = now() WHERE id = _user;
END;
$$;

-- Check & unlock achievements
CREATE OR REPLACE FUNCTION public.check_achievements(_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_modules_done INTEGER;
  v_courses_done INTEGER;
  v_perfect INTEGER;
  v_streak INTEGER;
  v_xp INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_modules_done FROM public.module_progress WHERE user_id = _user AND completed = true;
  SELECT COUNT(DISTINCT course_id) INTO v_courses_done FROM public.certificates WHERE user_id = _user;
  SELECT COUNT(*) INTO v_perfect FROM public.quiz_attempts WHERE user_id = _user AND score = 100;
  SELECT COALESCE(streak,0), COALESCE(xp,0) INTO v_streak, v_xp FROM public.profiles WHERE id = _user;

  IF v_modules_done >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT _user, id FROM public.achievements WHERE code = 'first_step'
      ON CONFLICT DO NOTHING;
  END IF;
  IF v_streak >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT _user, id FROM public.achievements WHERE code = 'full_week'
      ON CONFLICT DO NOTHING;
  END IF;
  IF v_perfect >= 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT _user, id FROM public.achievements WHERE code = 'perfectionist'
      ON CONFLICT DO NOTHING;
  END IF;
  IF v_courses_done >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT _user, id FROM public.achievements WHERE code = 'trailblazer'
      ON CONFLICT DO NOTHING;
  END IF;
  IF v_xp >= 2500 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT _user, id FROM public.achievements WHERE code = 'master_fcia'
      ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Award XP on module completion
CREATE OR REPLACE FUNCTION public.xp_on_module_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed = true AND (OLD IS NULL OR OLD.completed = false) THEN
    PERFORM public.award_xp(NEW.user_id, 50, 'module_complete', NEW.module_id);
    PERFORM public.check_achievements(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_xp_module ON public.module_progress;
CREATE TRIGGER trg_xp_module
  AFTER INSERT OR UPDATE OF completed ON public.module_progress
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_module_complete();

-- Award XP on certificate (course complete) + first course bonus
CREATE OR REPLACE FUNCTION public.xp_on_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.certificates WHERE user_id = NEW.user_id;
  PERFORM public.award_xp(NEW.user_id, 200, 'course_complete', NEW.course_id);
  IF v_count = 1 THEN
    PERFORM public.award_xp(NEW.user_id, 100, 'first_course_bonus', NEW.course_id);
  END IF;
  PERFORM public.check_achievements(NEW.user_id);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_xp_certificate ON public.certificates;
CREATE TRIGGER trg_xp_certificate
  AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_certificate();

-- Daily login XP + streak (callable from client via RPC)
CREATE OR REPLACE FUNCTION public.register_daily_login()
RETURNS TABLE(awarded INTEGER, new_streak INTEGER, new_xp INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_last DATE;
  v_today DATE := (now() AT TIME ZONE 'UTC')::DATE;
  v_streak INTEGER;
  v_awarded INTEGER := 0;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT (last_login_at AT TIME ZONE 'UTC')::DATE, COALESCE(streak,0)
    INTO v_last, v_streak FROM public.profiles WHERE id = v_user;

  IF v_last IS NULL OR v_last < v_today THEN
    IF v_last = v_today - 1 THEN
      v_streak := v_streak + 1;
    ELSE
      v_streak := 1;
    END IF;
    UPDATE public.profiles SET last_login_at = now(), streak = v_streak WHERE id = v_user;
    PERFORM public.award_xp(v_user, 10, 'daily_login', NULL);
    v_awarded := 10;
    PERFORM public.check_achievements(v_user);
  END IF;

  RETURN QUERY SELECT v_awarded, v_streak, (SELECT xp FROM public.profiles WHERE id = v_user);
END;
$$;
GRANT EXECUTE ON FUNCTION public.register_daily_login() TO authenticated;-- [DML removido] INSERT INTO public.achievements (code, title, description, icon, xp_reward, sort_order) VA



-- ============================================================
-- Source: 20260622203857_6282114c-caff-4cf2-97d3-1caafa189253.sql
-- ============================================================


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


-- ============================================================
-- Source: 20260622203919_f3250617-0685-40a9-b3e9-c2df72e0335c.sql
-- ============================================================


CREATE POLICY "Admins manage course-assets" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'course-assets' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'course-assets' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Authenticated read course-assets" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-assets');


-- ============================================================
-- Source: 20260622205259_5cd6a4ea-fdb3-47ca-8dc5-7bc84b609783.sql
-- ============================================================


-- Plans table
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','expired','trialing','past_due')),
  provider TEXT,
  provider_subscription_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON public.subscriptions(user_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subs" ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage subs" ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Mark tracks with required plan tier
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS required_plan TEXT NOT NULL DEFAULT 'free'
  CHECK (required_plan IN ('free','starter','pro','expert'));-- [DML removido] INSERT INTO public.plans (id, name, price, features, sort_order) VALUES


-- Helper: get current plan id for a user
CREATE OR REPLACE FUNCTION public.current_plan(_user UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT plan_id FROM public.subscriptions
    WHERE user_id = _user
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY started_at DESC
    LIMIT 1
  ), 'free');
$$;

-- Plan tier rank
CREATE OR REPLACE FUNCTION public.plan_rank(_plan TEXT)
RETURNS INTEGER
LANGUAGE SQL IMMUTABLE
AS $$
  SELECT CASE _plan
    WHEN 'free' THEN 0
    WHEN 'starter' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'expert' THEN 3
    ELSE 0
  END;
$$;

-- Check track access
CREATE OR REPLACE FUNCTION public.can_access_track(_user UUID, _track UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.plan_rank(public.current_plan(_user)) >= public.plan_rank(
    COALESCE((SELECT required_plan FROM public.tracks WHERE id = _track), 'free')
  );
$$;

-- Auto-create FREE subscription on signup
CREATE OR REPLACE FUNCTION public.assign_free_plan()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_assign_free_plan ON auth.users;
CREATE TRIGGER on_auth_user_assign_free_plan
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_free_plan();-- [DML removido] INSERT INTO public.subscriptions (user_id, plan_id, status)



-- ============================================================
-- Source: 20260622232749_e8582ecf-2705-4d5a-a182-cde2f655148f.sql
-- ============================================================


ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS video_url TEXT;

CREATE POLICY "course-videos admin write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-videos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "course-videos admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "course-videos admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "course-videos authenticated read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-videos');


-- ============================================================
-- Source: 20260622234242_39077966-fd18-4b05-a0a9-a1ec69e2205e.sql
-- ============================================================


-- 1) Auto-promote specific email to admin on signup
CREATE OR REPLACE FUNCTION public.auto_promote_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'blindadoemotivado@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_promote_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_promote_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_promote_admin();-- [DML removido] INSERT INTO public.user_roles (user_id, role)
-- [DML removido] DELETE FROM public.questions WHERE module_id IN (
-- [DML removido] DELETE FROM public.modules WHERE course_id IN (SELECT id FROM public.courses WHERE slug = 
-- [DML removido] DELETE FROM public.courses WHERE slug = 'curso-demo-e2e';
-- [DML removido] DELETE FROM public.tracks WHERE slug = 'trilha-demo-e2e';


DO $seed$
DECLARE
  v_track_id UUID;
  v_course_id UUID;
  v_module_id UUID;
  v_video TEXT := 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  v_pdf   TEXT := 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  i INT;
  titles TEXT[] := ARRAY[
    'Introdução à Plataforma',
    'Conceitos Fundamentais',
    'Práticas Essenciais',
    'Aplicações Avançadas',
    'Projeto Final e Avaliação'
  ];
BEGIN
  INSERT INTO public.tracks (slug, title, description, tag, level, hours, modules, icon, outcomes, sort_order, is_published, required_plan)
  VALUES ('trilha-demo-e2e', 'Trilha Demo E2E', 'Trilha de demonstração para testes ponta a ponta.', 'Demo', 'Iniciante', '5h', 5, 'Sparkles',
          ARRAY['Validar fluxo completo','Testar quizzes','Testar emissão de certificado'], 999, true, 'free')
  RETURNING id INTO v_track_id;

  INSERT INTO public.courses (track_id, slug, title, description, duration_minutes, level, sort_order, is_published)
  VALUES (v_track_id, 'curso-demo-e2e', 'Curso Demo E2E', 'Curso completo para testes end-to-end com vídeo, PDF e quiz.', 300, 'Iniciante', 1, true)
  RETURNING id INTO v_course_id;

  FOR i IN 1..5 LOOP
    INSERT INTO public.modules (course_id, slug, title, description, content_type, content_url, video_url, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'modulo-demo-' || i, 'Módulo ' || i || ' — ' || titles[i],
            'Módulo demonstrativo ' || i || ' com vídeo, PDF e quiz integrados.',
            'video', v_pdf, v_video, 30, i, true)
    RETURNING id INTO v_module_id;

    INSERT INTO public.questions (module_id, question, type, options, correct_answer, explanation, sort_order) VALUES
    (v_module_id, 'Qual o principal objetivo do Módulo ' || i || '?', 'multiple_choice',
       '["Demonstrar funcionalidades","Vender produtos","Confundir o aluno","Nenhuma das anteriores"]'::jsonb,
       'Demonstrar funcionalidades', 'Este módulo serve para demonstração end-to-end.', 1),
    (v_module_id, 'Quais formatos de conteúdo este módulo apresenta?', 'multiple_choice',
       '["Apenas vídeo","Apenas PDF","Vídeo, PDF e quiz","Apenas quiz"]'::jsonb,
       'Vídeo, PDF e quiz', 'Cada módulo demo contém vídeo, PDF e quiz.', 2),
    (v_module_id, 'A FCIA Academy utiliza qual backend?', 'multiple_choice',
       '["Firebase","Lovable Cloud","AWS RDS","Nenhum"]'::jsonb,
       'Lovable Cloud', 'A FCIA Academy utiliza Lovable Cloud.', 3);
  END LOOP;
END
$seed$;


-- ============================================================
-- Source: 20260623004231_d9e536a9-82b1-4add-9ed1-61637b5f291a.sql
-- ============================================================

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;