DO $$
DECLARE
  v_course_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'influencer-com-ia' LIMIT 1;

  IF v_course_id IS NOT NULL THEN
    -- Apaga qualquer módulo antigo/hallucinado além do Módulo 1
    DELETE FROM public.modules WHERE course_id = v_course_id AND order_index > 1;

    -- Insere somente o Módulo 2
    INSERT INTO public.modules (course_id, title, order_index, is_active, description)
    VALUES (
      v_course_id,
      'Módulo 2: O Rosto e a Estética',
      2,
      true,
      'Engenharia de prompts visuais no Nano Banana Pro. Consistência de personagem e técnica de face-swap via Pinterest.'
    );
  END IF;
END $$;
