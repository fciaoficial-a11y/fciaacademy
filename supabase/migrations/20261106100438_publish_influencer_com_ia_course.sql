-- Publica o curso "Influencer com IA" corrigindo o unico item faltante no
-- checklist de publicacao (carga horaria). Idempotente: pode rodar varias vezes.

DO $$
DECLARE
  v_course_id uuid;
BEGIN
  SELECT id INTO v_course_id
  FROM public.courses
  WHERE slug = 'influencer-com-ia'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Curso influencer-com-ia nao encontrado; nada a fazer.';
    RETURN;
  END IF;

  UPDATE public.courses
     SET workload_hours = CASE WHEN COALESCE(workload_hours, 0) > 0 THEN workload_hours ELSE 80 END,
         duration_minutes = CASE WHEN COALESCE(duration_minutes, 0) > 0 THEN duration_minutes ELSE 4800 END,
         cover_url = COALESCE(
           NULLIF(cover_url, ''),
           'https://images.unsplash.com/photo-1614729939124-03290b5609ce?q=80&w=800&auto=format&fit=crop'
         ),
         is_published = true
   WHERE id = v_course_id;

  -- Garante que o curso esteja ligado a uma trilha publicada (Renda com IA).
  IF EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.tracks t ON t.id = c.track_id
    WHERE c.id = v_course_id AND t.is_published = true
  ) THEN
    RAISE NOTICE 'Curso influencer-com-ia publicado na trilha atual.';
  ELSE
    WITH target AS (
      SELECT id FROM public.tracks
      WHERE is_published = true
      ORDER BY (slug = 'renda-com-ia') DESC, sort_order
      LIMIT 1
    )
    UPDATE public.courses c
       SET track_id = target.id
      FROM target
     WHERE c.id = v_course_id;

    RAISE NOTICE 'Curso influencer-com-ia religado a uma trilha publicada.';
  END IF;
END $$;

-- Reforca visibilidade de leitura dos cursos publicados (idempotente).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'courses'
      AND policyname = 'courses_public_read_published'
  ) THEN
    CREATE POLICY "courses_public_read_published"
      ON public.courses FOR SELECT
      TO anon, authenticated
      USING (is_published = true);
  END IF;
END $$;
