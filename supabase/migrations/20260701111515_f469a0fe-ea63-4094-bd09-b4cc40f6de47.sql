
-- 1) Seed das conquistas (idempotente)
INSERT INTO public.achievements (code, title, description, icon, xp_reward, sort_order) VALUES
  ('first_step',   'Primeiro Passo',  'Concluiu seu primeiro módulo na FCIA Academy.', 'Footprints', 25,  1),
  ('full_week',    'Semana Cheia',    '7 dias consecutivos de estudo. Consistência de mestre.', 'Flame',      50,  2),
  ('perfectionist','Perfeccionista',  '3 quizzes seguidos com 100% de acerto.',        'Target',     75,  3),
  ('trailblazer',  'Trilheiro',       'Concluiu uma trilha completa da Academy.',      'Mountain',   150, 4),
  ('master_fcia',  'Mestre FCIA',     'Atingiu o nível máximo: Mestre FCIA.',          'Crown',      250, 5)
ON CONFLICT (code) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      xp_reward = EXCLUDED.xp_reward,
      sort_order = EXCLUDED.sort_order;

-- 2) Triggers de XP (módulo, certificado, quiz)
DROP TRIGGER IF EXISTS trg_xp_on_module_complete ON public.module_progress;
CREATE TRIGGER trg_xp_on_module_complete
  AFTER INSERT OR UPDATE ON public.module_progress
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_module_complete();

DROP TRIGGER IF EXISTS trg_xp_on_certificate ON public.certificates;
CREATE TRIGGER trg_xp_on_certificate
  AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_certificate();

DROP TRIGGER IF EXISTS trg_issue_certificate_on_pass ON public.quiz_attempts;
CREATE TRIGGER trg_issue_certificate_on_pass
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.issue_certificate_on_pass();

-- 3) XP por aprovação em quiz (+30 se 100%, +10 se 70-99%)
CREATE OR REPLACE FUNCTION public.xp_on_quiz_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.passed = true THEN
    IF NEW.score = 100 THEN
      PERFORM public.award_xp(NEW.user_id, 30, 'quiz_perfect', NEW.module_id);
    ELSE
      PERFORM public.award_xp(NEW.user_id, 10, 'quiz_passed', NEW.module_id);
    END IF;
    PERFORM public.check_achievements(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_xp_on_quiz_attempt ON public.quiz_attempts;
CREATE TRIGGER trg_xp_on_quiz_attempt
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_quiz_attempt();

-- 4) Sincroniza automaticamente profiles.level quando xp muda
DROP TRIGGER IF EXISTS trg_sync_profile_level ON public.profiles;
CREATE TRIGGER trg_sync_profile_level
  BEFORE INSERT OR UPDATE OF xp ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_level();

-- 5) check_achievements: Perfeccionista (3 quizzes 100% seguidos) e Trilheiro (trilha inteira)
CREATE OR REPLACE FUNCTION public.check_achievements(_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_modules_done INTEGER;
  v_streak INTEGER;
  v_xp INTEGER;
  v_perfect_streak INTEGER := 0;
  v_track_complete BOOLEAN := false;
  r RECORD;
BEGIN
  SELECT COUNT(*) INTO v_modules_done FROM public.module_progress WHERE user_id = _user AND completed = true;
  SELECT COALESCE(streak,0), COALESCE(xp,0) INTO v_streak, v_xp FROM public.profiles WHERE id = _user;

  -- Perfeccionista: streak atual de quizzes 100% (últimas tentativas por módulo)
  FOR r IN
    SELECT DISTINCT ON (module_id) module_id, score, created_at
      FROM public.quiz_attempts
      WHERE user_id = _user
      ORDER BY module_id, created_at DESC
  LOOP
    IF r.score = 100 THEN
      v_perfect_streak := v_perfect_streak + 1;
    END IF;
  END LOOP;

  -- Trilheiro: existe alguma trilha em que TODOS os cursos publicados foram certificados?
  SELECT EXISTS (
    SELECT 1
    FROM public.tracks t
    WHERE (
      SELECT COUNT(*) FROM public.courses c WHERE c.track_id = t.id AND c.is_published
    ) > 0
    AND NOT EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.track_id = t.id AND c.is_published
        AND NOT EXISTS (
          SELECT 1 FROM public.certificates ce
          WHERE ce.user_id = _user AND ce.course_id = c.id AND ce.revoked_at IS NULL
        )
    )
  ) INTO v_track_complete;

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
  IF v_perfect_streak >= 3 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT _user, id FROM public.achievements WHERE code = 'perfectionist'
      ON CONFLICT DO NOTHING;
  END IF;
  IF v_track_complete THEN
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
