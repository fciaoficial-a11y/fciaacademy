
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
GRANT EXECUTE ON FUNCTION public.register_daily_login() TO authenticated;

-- Seed achievements
INSERT INTO public.achievements (code, title, description, icon, xp_reward, sort_order) VALUES
  ('first_step', 'Primeiro Passo', 'Conclua seu primeiro módulo.', 'Footprints', 25, 1),
  ('full_week', 'Semana Cheia', 'Mantenha um streak de 7 dias consecutivos.', 'Flame', 75, 2),
  ('perfectionist', 'Perfeccionista', 'Acerte 100% em um quiz.', 'Target', 50, 3),
  ('trailblazer', 'Trilheiro', 'Conclua 3 cursos.', 'Mountain', 150, 4),
  ('master_fcia', 'Mestre FCIA', 'Alcance 2500 XP.', 'Crown', 250, 5)
ON CONFLICT (code) DO NOTHING;
