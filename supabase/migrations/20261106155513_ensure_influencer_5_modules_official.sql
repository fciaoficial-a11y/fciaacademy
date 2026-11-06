-- Garante os 5 módulos oficiais do curso Influencer com IA
-- Usa apenas colunas reais da tabela modules: id, course_id, slug, title, description,
-- content_type, duration_minutes, sort_order, is_published
DO $$
DECLARE
  v_course_id uuid;
BEGIN
  SELECT id INTO v_course_id
  FROM public.courses
  WHERE slug = 'influencer-com-ia'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RETURN;
  END IF;

  -- Módulo 1
  IF NOT EXISTS (
    SELECT 1 FROM public.modules
    WHERE course_id = v_course_id AND title ILIKE '%Boas-vindas%'
  ) THEN
    INSERT INTO public.modules (course_id, slug, title, description, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'm1-boas-vindas-dna-da-influenciadora',
            'Módulo 1: Boas-vindas e O DNA da Influenciadora',
            'Abertura e criação da persona.', 'video', 25, 1, true);
  END IF;

  -- Módulo 2
  IF NOT EXISTS (
    SELECT 1 FROM public.modules
    WHERE course_id = v_course_id AND title ILIKE '%O Rosto e a Estética%'
  ) THEN
    INSERT INTO public.modules (course_id, slug, title, description, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'm2-rosto-e-estetica',
            'Módulo 2: O Rosto e a Estética',
            'Engenharia de prompts visuais.', 'video', 30, 2, true);
  END IF;

  -- Módulo 3
  IF NOT EXISTS (
    SELECT 1 FROM public.modules
    WHERE course_id = v_course_id AND title ILIKE '%Criação de Conteúdo e Vídeo%'
  ) THEN
    INSERT INTO public.modules (course_id, slug, title, description, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'm3-criacao-de-conteudo-e-video',
            'Módulo 3: Criação de Conteúdo e Vídeo',
            'Produção de vídeos de alta conversão.', 'video', 35, 3, true);
  END IF;

  -- Módulo 4
  IF NOT EXISTS (
    SELECT 1 FROM public.modules
    WHERE course_id = v_course_id AND title ILIKE '%Posicionamento e Autoridade%'
  ) THEN
    INSERT INTO public.modules (course_id, slug, title, description, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'm4-posicionamento-e-autoridade',
            'Módulo 4: Posicionamento e Autoridade',
            'Construção de autoridade de marca.', 'video', 30, 4, true);
  END IF;

  -- Módulo 5
  IF NOT EXISTS (
    SELECT 1 FROM public.modules
    WHERE course_id = v_course_id AND title ILIKE '%Monetização e Escala%'
  ) THEN
    INSERT INTO public.modules (course_id, slug, title, description, content_type, duration_minutes, sort_order, is_published)
    VALUES (v_course_id, 'm5-monetizacao-e-escala',
            'Módulo 5: Monetização e Escala',
            'Estratégias de monetização e escala.', 'video', 30, 5, true);
  END IF;
END $$;
