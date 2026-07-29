-- ========== course_bonuses ==========
CREATE TABLE public.course_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  value_label TEXT,
  description TEXT NOT NULL,
  pdf_path TEXT,
  cover_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);

CREATE INDEX idx_course_bonuses_course ON public.course_bonuses(course_id) WHERE is_published;

-- Column-level GRANT: anon/authenticated NÃO recebem SELECT em pdf_path.
-- Service role e a auth-middleware (via SECURITY DEFINER functions) leem o campo.
GRANT SELECT (id, course_id, slug, title, subtitle, value_label, description, cover_url, sort_order, is_published, created_at, updated_at)
  ON public.course_bonuses TO anon, authenticated;
GRANT ALL ON public.course_bonuses TO service_role;

ALTER TABLE public.course_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published bonuses"
  ON public.course_bonuses FOR SELECT
  USING (is_published = true);

CREATE POLICY "admins manage bonuses"
  ON public.course_bonuses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_course_bonuses_updated_at
  BEFORE UPDATE ON public.course_bonuses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== bonus_downloads ==========
CREATE TABLE public.bonus_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_id UUID NOT NULL REFERENCES public.course_bonuses(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bonus_downloads_user ON public.bonus_downloads(user_id, downloaded_at DESC);
CREATE INDEX idx_bonus_downloads_bonus ON public.bonus_downloads(bonus_id, downloaded_at DESC);

GRANT SELECT, INSERT ON public.bonus_downloads TO authenticated;
GRANT ALL ON public.bonus_downloads TO service_role;

ALTER TABLE public.bonus_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own downloads"
  ON public.bonus_downloads FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users log own downloads"
  ON public.bonus_downloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========== Server-side helper: retorna pdf_path apenas para quem tem acesso ==========
-- SECURITY DEFINER: consulta pdf_path bypassando o GRANT column-level,
-- mas só devolve se o usuário tiver enrollment/acesso ao curso do bônus.
CREATE OR REPLACE FUNCTION public.get_bonus_download_path(_bonus_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_course UUID;
  v_path TEXT;
  v_published BOOLEAN;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT course_id, pdf_path, is_published
    INTO v_course, v_path, v_published
    FROM public.course_bonuses
   WHERE id = _bonus_id;

  IF v_course IS NULL OR v_published IS NOT TRUE THEN
    RAISE EXCEPTION 'bonus_unavailable';
  END IF;

  IF NOT (public.has_course_access(v_user, v_course) OR public.has_role(v_user, 'admin')) THEN
    RAISE EXCEPTION 'no_access';
  END IF;

  -- Registra o download (idempotente por chamada — cada request loga uma linha)
  INSERT INTO public.bonus_downloads (user_id, bonus_id) VALUES (v_user, _bonus_id);

  RETURN v_path;
END;
$$;

REVOKE ALL ON FUNCTION public.get_bonus_download_path(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_bonus_download_path(UUID) TO authenticated;