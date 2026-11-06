-- Corrige o curso Influencer com IA: completa os itens do checklist de
-- publicação e publica os 5 módulos ANTES de ligar is_published no curso.
-- Ordem importa: a regra do banco (enforce_course_publish_rules) exige
-- capa, preço/carga e pelo menos 3 módulos publicados.

DO $$
DECLARE
  v_course_id uuid;
  v_modules_published integer;
BEGIN
  SELECT id INTO v_course_id
  FROM public.courses
  WHERE slug = 'influencer-com-ia'
     OR title ILIKE '%Influencer com IA%'
     OR title ILIKE '%Influenciador de IA%'
  ORDER BY (slug = 'influencer-com-ia') DESC
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE NOTICE 'Curso Influencer com IA nao encontrado — nada a fazer.';
    RETURN;
  END IF;

  -- 1) Padroniza identificacao e itens comerciais do checklist.
  UPDATE public.courses
  SET
    title          = 'Influencer com IA',
    slug           = 'influencer-com-ia',
    description    = COALESCE(NULLIF(description, ''), 'Curso pratico de 5 modulos para criar, escalar e monetizar influenciadores de IA no TikTok Shop.'),
    cover_url      = COALESCE(NULLIF(cover_url, ''), 'https://images.unsplash.com/photo-1614729939124-03290b5609ce?q=80&w=800&auto=format&fit=crop'),
    price          = COALESCE(NULLIF(price, 0), 97.00),
    is_free        = false,
    workload_hours = COALESCE(NULLIF(workload_hours, 0), 80)
  WHERE id = v_course_id;

  -- 2) Publica os modulos para o contador do checklist fechar.
  UPDATE public.modules
  SET is_published = true
  WHERE course_id = v_course_id;

  UPDATE public.modules
  SET is_active = true
  WHERE course_id = v_course_id;

  SELECT COUNT(*) INTO v_modules_published
  FROM public.modules
  WHERE course_id = v_course_id
    AND COALESCE(is_published, true) = true;

  -- 3) Só agora publica o curso.
  IF v_modules_published >= 3 THEN
    UPDATE public.courses
    SET is_published = true
    WHERE id = v_course_id;
  ELSE
    RAISE NOTICE 'Modulos publicados: % — curso mantido em rascunho.', v_modules_published;
  END IF;
END $$;