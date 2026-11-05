-- Seed corrigido do curso "Influencer com IA" (FCIA Academy)
-- Corrige a migration 20261105205131_seed_influencer_com_ia_course.sql,
-- que falhou no trigger enforce_course_publish_rules por ausência de capa.
-- Idempotente: pode rodar mais de uma vez sem duplicar registros.

DO $$
DECLARE
  v_course_id uuid;
  v_slug text := 'influencer-com-ia';
  v_cover text := 'https://images.unsplash.com/photo-1614729939124-03290b5609ce?q=80&w=800&auto=format&fit=crop';
  v_thumb text := 'https://images.unsplash.com/photo-1614729939124-03290b5609ce?q=80&w=800&auto=format&fit=crop';
  v_module_titles text[] := ARRAY[
    'O DNA da Influenciadora',
    'O Rosto e a Estética',
    'O Realismo Cinematográfico',
    'Movimento, Fala e Sincronia Labial',
    'Escala e Monetização'
  ];
  v_mod text;
  i int := 0;
BEGIN
  -- 1) Curso
  SELECT id INTO v_course_id FROM public.courses WHERE slug = v_slug LIMIT 1;

  IF v_course_id IS NULL THEN
    INSERT INTO public.courses (
      title,
      slug,
      description,
      product_type,
      is_published,
      is_free,
      price,
      cover_url,
      thumbnail_url,
      workload_hours,
      level,
      display_order
    ) VALUES (
      'Influencer com IA',
      v_slug,
      'Aprenda a criar uma influenciadora digital completa com inteligência artificial: identidade, rosto, estética, realismo cinematográfico, movimento, voz e monetização em escala.',
      'course',
      true,
      false,
      497.00,
      v_cover,
      v_thumb,
      12,
      'Intermediário',
      100
    )
    RETURNING id INTO v_course_id;
  ELSE
    -- Já existe: garante que a capa está preenchida (a validação exige)
    UPDATE public.courses
       SET cover_url = COALESCE(NULLIF(cover_url, ''), v_cover),
           thumbnail_url = COALESCE(NULLIF(thumbnail_url, ''), v_thumb),
           is_published = true,
           updated_at = now()
     WHERE id = v_course_id;
  END IF;

  -- 2) Os 5 módulos
  FOREACH v_mod IN ARRAY v_module_titles LOOP
    i := i + 1;

    IF NOT EXISTS (
      SELECT 1 FROM public.modules
       WHERE course_id = v_course_id AND title = v_mod
    ) THEN
      INSERT INTO public.modules (
        course_id,
        title,
        description,
        position,
        display_order,
        is_published
      ) VALUES (
        v_course_id,
        v_mod,
        'Módulo ' || i || ' do curso Influencer com IA.',
        i,
        i,
        true
      );
    END IF;
  END LOOP;
END $$;

-- 3) Sanidade: mostra o estado final no log da migration
DO $$
DECLARE
  v_course_id uuid;
  v_mods int;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influencer-com-ia' LIMIT 1;
  SELECT COUNT(*) INTO v_mods FROM public.modules WHERE course_id = v_course_id;
  RAISE NOTICE 'Seed influencer-com-ia: course_id=%, modulos=%', v_course_id, v_mods;
END $$;
