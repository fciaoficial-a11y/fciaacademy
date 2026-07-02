
-- 1) Estender questions para banco persistente
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('apostila','modulo','curso','ai','manual')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('draft','approved','archived')),
  ADD COLUMN IF NOT EXISTS times_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- Backfill course_id a partir do módulo
UPDATE public.questions q
   SET course_id = m.course_id
  FROM public.modules m
 WHERE q.module_id = m.id AND q.course_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_questions_course_status ON public.questions(course_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_module_status ON public.questions(module_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);

-- 2) RPC: montar prova aleatória a partir do banco, sem IA
CREATE OR REPLACE FUNCTION public.assemble_exam(_course_id UUID, _size INTEGER DEFAULT 10)
RETURNS SETOF public.questions
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_last_ids UUID[];
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF NOT public.has_course_access(v_user, _course_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Ids da última tentativa do usuário neste curso (para tentar evitar repetir)
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

-- 3) Marca uso das questões (após montar a prova)
CREATE OR REPLACE FUNCTION public.mark_questions_used(_ids UUID[])
RETURNS void
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.questions
     SET times_used = times_used + 1, last_used_at = now()
   WHERE id = ANY(_ids);
$$;

-- 4) Cobertura de banco por curso/módulo (admin)
CREATE OR REPLACE FUNCTION public.question_bank_coverage()
RETURNS TABLE(course_id UUID, course_title TEXT, module_id UUID, module_title TEXT, approved_count BIGINT, draft_count BIGINT)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
    SELECT c.id, c.title, m.id, m.title,
           COALESCE(SUM(CASE WHEN q.status='approved' THEN 1 ELSE 0 END),0),
           COALESCE(SUM(CASE WHEN q.status='draft'    THEN 1 ELSE 0 END),0)
      FROM public.courses c
      LEFT JOIN public.modules m ON m.course_id = c.id
      LEFT JOIN public.questions q ON q.module_id = m.id
     GROUP BY c.id, c.title, m.id, m.title
     ORDER BY c.title, m.title;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assemble_exam(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_questions_used(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.question_bank_coverage() TO authenticated;
