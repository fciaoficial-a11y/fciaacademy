-- ============================================================
--  Publica o curso Influencer com IA respeitando a ordem das
--  dependencias exigidas pelo trigger enforce_course_publish_rules:
--  primeiro os modulos publicados, depois o curso.
--  Idempotente: pode rodar quantas vezes for necessario.
-- ============================================================

DO $$
DECLARE
  v_course_id uuid;
  v_updated   int := 0;
  v_pub_mods  int := 0;
BEGIN
  SELECT id INTO v_course_id
  FROM public.courses
  WHERE slug = 'influencer-com-ia'
     OR title ILIKE '%Influenciador de IA%'
     OR title ILIKE '%Influencer com IA%'
  ORDER BY (slug = 'influencer-com-ia') DESC
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Curso Influencer com IA nao encontrado - nada a fazer.';
    RETURN;
  END IF;

  -- 1) PRIMEIRO: ativa/publica todos os modulos do curso para satisfazer o trigger.
  --    As colunas variam entre versoes do schema, entao cobrimos as duas nomenclaturas
  --    checando a existencia antes de atualizar.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'is_published'
  ) THEN
    EXECUTE 'UPDATE public.modules SET is_published = true WHERE course_id = $1'
      USING v_course_id;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE 'Modulos com is_published=true: %', v_updated;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'is_active'
  ) THEN
    EXECUTE 'UPDATE public.modules SET is_active = true WHERE course_id = $1'
      USING v_course_id;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE 'Modulos com is_active=true: %', v_updated;
  END IF;

  -- 2) DEPOIS: atualiza e publica o curso.
  UPDATE public.courses
     SET title         = 'Influencer com IA',
         slug          = 'influencer-com-ia',
         workload_hours = 80,
         price         = 97.00,
         is_published  = true,
         cover_url      = COALESCE(
           NULLIF(cover_url, ''),
           'https://images.unsplash.com/photo-1614729939124-03290b5609ce?q=80&w=800&auto=format&fit=crop'
         )
   WHERE id = v_course_id;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Curso atualizado/publicado: %', v_updated;

  SELECT count(*) INTO v_pub_mods
  FROM public.modules
  WHERE course_id = v_course_id;

  RAISE NOTICE 'Curso % | modulos vinculados: %', v_course_id, v_pub_mods;
END $$;

-- Nota: o SELECT de verificacao
--   SELECT title, is_published FROM public.courses WHERE slug = 'influencer-com-ia';
-- deve ser executado apos a aplicacao desta migration para confirmar is_published = true.
