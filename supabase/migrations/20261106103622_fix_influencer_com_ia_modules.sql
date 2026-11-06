-- Substitui os modulos do curso influencer-com-ia pelos 5 modulos praticos.
-- Idempotente: pode rodar mais de uma vez sem duplicar.

DO $$
DECLARE
  v_course_id uuid;
  v_titles text[] := ARRAY[
    'O DNA da Influenciadora',
    'O Rosto e a Estetica',
    'O Realismo Cinematografico',
    'Movimento, Fala e Sincronia Labial',
    'Escala e Monetizacao'
  ];
  v_i int;
  v_mod_id uuid;
BEGIN
  SELECT id INTO v_course_id
  FROM public.courses
  WHERE slug = 'influencer-com-ia'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Curso influencer-com-ia nao encontrado; nada a fazer.';
    RETURN;
  END IF;

  FOR v_i IN 1..5 LOOP
    SELECT id INTO v_mod_id
    FROM public.modules
    WHERE course_id = v_course_id AND sort_order = v_i
    LIMIT 1;

    IF v_mod_id IS NULL THEN
      INSERT INTO public.modules (course_id, slug, title, description, content_type, sort_order, duration_minutes, is_published, is_active)
      VALUES (
        v_course_id,
        'influencer-ia-m' || v_i,
        v_titles[v_i],
        'Modulo pratico ' || v_i || ' do curso Influencer com IA.',
        'text',
        v_i,
        30,
        true,
        true
      )
      RETURNING id INTO v_mod_id;
    ELSE
      UPDATE public.modules
      SET title = v_titles[v_i],
          is_published = true,
          is_active = true,
          sort_order = v_i
      WHERE id = v_mod_id;
    END IF;

    -- Questoes: recria as do modulo para garantir o quiz de 70%
    DELETE FROM public.questions WHERE module_id = v_mod_id;

    INSERT INTO public.questions (module_id, question, options, correct_answer, explanation, status, type)
    VALUES
    (
      v_mod_id,
      'Qual e o objetivo central do modulo ''' || v_titles[v_i] || '''?',
      jsonb_build_array(
        'Produzir uma influenciadora virtual consistente e vendevel',
        'Decorar termos tecnicos sem aplicacao',
        'Comprar seguidores prontos',
        'Ignorar o posicionamento de marca'
      ),
      'Produzir uma influenciadora virtual consistente e vendevel',
      'O foco do curso e a execucao pratica de uma influenciadora virtual que converte.',
      'approved',
      'multiple_choice'
    ),
    (
      v_mod_id,
      'O proximo modulo libera quando o aluno:',
      jsonb_build_array(
        'Assiste ao video ate o fim',
        'Acerta 70% ou mais no quiz do modulo atual',
        'Pede liberacao no suporte',
        'Paga uma nova parcela'
      ),
      'Acerta 70% ou mais no quiz do modulo atual',
      'A regra de progressao exige nota minima de 70% no quiz para desbloquear o modulo seguinte.',
      'approved',
      'multiple_choice'
    );
  END LOOP;

  -- Remove os modulos que sobraram (os antigos, incluindo o Modulo 0)
  DELETE FROM public.questions
  WHERE module_id IN (
    SELECT id FROM public.modules
    WHERE course_id = v_course_id AND (sort_order IS NULL OR sort_order < 1 OR sort_order > 5)
  );

  DELETE FROM public.modules
  WHERE course_id = v_course_id AND (sort_order IS NULL OR sort_order < 1 OR sort_order > 5);
END $$;
