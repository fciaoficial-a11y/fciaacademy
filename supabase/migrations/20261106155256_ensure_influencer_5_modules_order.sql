-- Garante os 5 modulos do curso Influencer com IA, ordenados por order_index
DO $$
DECLARE
  v_course_id uuid;
  v_titles text[] := ARRAY[
    'Módulo 1: Boas-vindas e O DNA da Influenciadora',
    'Módulo 2: O Rosto e a Estética',
    'Módulo 3: Criação de Conteúdo e Vídeo',
    'Módulo 4: Posicionamento e Autoridade',
    'Módulo 5: Monetização e Escala'
  ];
  v_descs text[] := ARRAY[
    'Abertura do curso e construção da persona completa da influenciadora com Gemini Pro.',
    'Engenharia de prompts visuais no Nano Banana Pro. Consistência de personagem e face-swap via Pinterest.',
    'Storytelling, roteiro e produção de vídeos curtos com IA para TikTok Shop.',
    'Posicionamento, nicho e autoridade percebida da influenciadora digital.',
    'Escala, funil, monetização e operação recorrente com TikTok Shop.'
  ];
  i int;
  v_module_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influencer-com-ia' LIMIT 1;

  IF v_course_id IS NULL THEN
    SELECT id INTO v_course_id FROM public.courses WHERE title ILIKE '%Influencer com IA%' LIMIT 1;
  END IF;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Curso influencer-com-ia nao encontrado; nada a fazer.';
    RETURN;
  END IF;

  FOR i IN 1..5 LOOP
    SELECT id INTO v_module_id
    FROM public.modules
    WHERE course_id = v_course_id AND order_index = i
    LIMIT 1;

    IF v_module_id IS NULL THEN
      SELECT id INTO v_module_id
      FROM public.modules
      WHERE course_id = v_course_id AND order_index IS NULL
      ORDER BY sort_order NULLS LAST
      LIMIT 1;
    END IF;

    IF v_module_id IS NULL THEN
      INSERT INTO public.modules (course_id, title, order_index, sort_order, is_active, description)
      VALUES (v_course_id, v_titles[i], i, i, true, v_descs[i])
      RETURNING id INTO v_module_id;
    ELSE
      UPDATE public.modules
      SET title = v_titles[i],
          order_index = i,
          sort_order = i,
          is_active = true,
          description = COALESCE(NULLIF(description, ''), v_descs[i])
      WHERE id = v_module_id;
    END IF;
  END LOOP;
END $$;
