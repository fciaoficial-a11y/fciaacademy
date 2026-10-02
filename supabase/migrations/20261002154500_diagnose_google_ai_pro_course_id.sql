-- ============================================================
-- DIAGNÓSTICO: Identificar o ID real do curso google-ai-pro
-- e devolver o resultado para o diagnóstico do checkout PIX.
-- NÃO ALTERA DADOS.
-- ============================================================

DO $$
DECLARE
  _course_record public.courses%ROWTYPE;
BEGIN
  -- Ler o curso google-ai-pro com o context que createPixCharge usa:
  -- authenticated (mesmo client de context.supabase)
  SELECT id, slug, title, price, is_published
    INTO _course_record
  FROM public.courses
  WHERE slug = 'google-ai-pro';

  IF NOT FOUND THEN
    RAISE NOTICE 'CURSO NAO ENCONTRADO: google-ai-pro';
  ELSE
    RAISE NOTICE 'ID=% | SLUG=% | TITLE=% | PRICE=% | IS_PUBLISHED=%',
      _course_record.id,
      _course_record.slug,
      _course_record.title,
      _course_record.price,
      _course_record.is_published;
  END IF;

  -- Ler também metodo-ia-criativa para comparacao
  SELECT id, slug, title, price, is_published
    INTO _course_record
  FROM public.courses
  WHERE slug = 'metodo-ia-criativa';

  IF NOT FOUND THEN
    RAISE NOTICE 'CURSO NAO ENCONTRADO: metodo-ia-criativa';
  ELSE
    RAISE NOTICE 'MASTERCLASS ID=% | SLUG=% | TITLE=% | PRICE=% | IS_PUBLISHED=%',
      _course_record.id,
      _course_record.slug,
      _course_record.title,
      _course_record.price,
      _course_record.is_published;
  END IF;

END $$;
