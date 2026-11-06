-- Corrige o curso Influencer com IA para exibir SOMENTE 5 modulos.
-- Estrategia nao-destrutiva: renomeia/renumera os modulos existentes
-- (preserva aulas, PDFs e questoes ja cadastrados) e arquiva os excedentes
-- despublicando-os. Nada e apagado.

DO $$
DECLARE
  v_course_id uuid;
  v_names text[] := ARRAY[
    'O DNA da Influenciadora',
    'O Rosto e a Estetica',
    'O Realismo Cinematografico',
    'Movimento, Fala e Sincronia Labial',
    'Escala e Monetizacao'
  ];
  v_ids uuid[];
  v_extras uuid[];
  v_i int;
BEGIN
  SELECT id INTO v_course_id
    FROM public.courses
   WHERE slug = 'influencer-com-ia'
      OR title ILIKE '%Influenciador de IA%'
   ORDER BY (slug = 'influencer-com-ia') DESC
   LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Curso influencer-com-ia nao encontrado; nada a fazer.';
    RETURN;
  END IF;

  -- IDs dos 5 primeiros modulos por ordem
  SELECT array_agg(id ORDER BY sort_order NULLS LAST, id)
    INTO v_ids
    FROM (
      SELECT id, sort_order
        FROM public.modules
       WHERE course_id = v_course_id
       ORDER BY sort_order NULLS LAST, id
       LIMIT 5
    ) s;

  -- Se houver menos de 5, completa criando os faltantes
  IF v_ids IS NULL THEN v_ids := ARRAY[]::uuid[]; END IF;

  FOR v_i IN 1..5 LOOP
    IF v_i <= array_length(v_ids, 1) THEN
      UPDATE public.modules
         SET title = v_names[v_i],
             sort_order = v_i,
             is_active = true
       WHERE id = v_ids[v_i];
    ELSE
      INSERT INTO public.modules (course_id, title, sort_order, is_active)
      VALUES (v_course_id, v_names[v_i], v_i, true);
    END IF;
  END LOOP;

  -- Modulos excedentes: despublica para nao aparecerem na area do aluno
  SELECT array_agg(id)
    INTO v_extras
    FROM public.modules
   WHERE course_id = v_course_id
     AND id <> ALL (v_ids)
     AND title <> ALL (v_names);

  IF v_extras IS NOT NULL THEN
    UPDATE public.modules
       SET is_active = false
     WHERE id = ANY (v_extras);
  END IF;

  -- Publica o curso (modulos ja ativos garantem o minimo de 3)
  UPDATE public.courses
     SET title = 'Influencer com IA',
         is_published = true,
         workload_hours = COALESCE(NULLIF(workload_hours, 0), 80),
         price = COALESCE(NULLIF(price, 0), 97.00),
         cover_url = COALESCE(cover_url, 'https://images.unsplash.com/photo-1614729939124-03290b5609ce?q=80&w=800&auto=format&fit=crop')
   WHERE id = v_course_id;
END $$;