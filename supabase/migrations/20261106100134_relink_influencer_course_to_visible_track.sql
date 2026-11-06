-- Garante que o curso "influencer-com-ia" esteja em uma trilha PUBLICADA
-- para que ele apareça em /cursos e na home (catálogo filtra por is_published).
-- Idempotente: só altera se o curso existir.

DO $$
DECLARE
  v_course_id uuid;
  v_track_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influencer-com-ia' LIMIT 1;
  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Curso influencer-com-ia não encontrado — nada a fazer.';
    RETURN;
  END IF;

  -- Mantém a trilha atual se ela já estiver publicada.
  SELECT c.track_id INTO v_track_id
    FROM public.courses c
    JOIN public.tracks t ON t.id = c.track_id
   WHERE c.id = v_course_id AND t.is_published = true
   LIMIT 1;

  IF v_track_id IS NULL THEN
    SELECT id INTO v_track_id
      FROM public.tracks
     WHERE is_published = true
     ORDER BY sort_order
     LIMIT 1;
  END IF;

  IF v_track_id IS NULL THEN
    RAISE NOTICE 'Nenhuma trilha publicada encontrada — curso permanece sem trilha visível.';
    RETURN;
  END IF;

  UPDATE public.courses
     SET track_id = v_track_id
   WHERE id = v_course_id
     AND (track_id IS DISTINCT FROM v_track_id);
END $$;
