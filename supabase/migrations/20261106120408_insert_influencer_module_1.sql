-- Insere APENAS o Módulo 1 do curso Influencer com IA (idempotente)
-- Sem apagar nenhum outro módulo existente.

DO $$
DECLARE
  v_course_id uuid;
  v_has_order_index boolean;
  v_sql text;
BEGIN
  SELECT id INTO v_course_id
  FROM public.courses
  WHERE slug = 'influencer-com-ia'
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Curso influencer-com-ia nao encontrado; nada a inserir.';
    RETURN;
  END IF;

  -- Evita duplicar o módulo caso a migration rode de novo
  IF EXISTS (
    SELECT 1 FROM public.modules
    WHERE course_id = v_course_id
      AND title = 'Módulo 1: Boas-vindas e O DNA da Influenciadora'
  ) THEN
    RAISE NOTICE 'Módulo 1 já existe; nada a fazer.';
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'modules'
      AND column_name = 'order_index'
  ) INTO v_has_order_index;

  IF v_has_order_index THEN
    INSERT INTO public.modules (course_id, title, order_index, is_active, description)
    VALUES (
      v_course_id,
      'Módulo 1: Boas-vindas e O DNA da Influenciadora',
      1,
      true,
      'Abertura do curso e construção da persona completa da influenciadora com Gemini Pro.'
    );
  ELSE
    -- Fallback para schema que usa sort_order no lugar de order_index
    INSERT INTO public.modules (course_id, title, sort_order, is_active, description)
    VALUES (
      v_course_id,
      'Módulo 1: Boas-vindas e O DNA da Influenciadora',
      1,
      true,
      'Abertura do curso e construção da persona completa da influenciadora com Gemini Pro.'
    );
  END IF;
END $$;
