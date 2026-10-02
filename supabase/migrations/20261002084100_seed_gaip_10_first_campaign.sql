-- Seed: Campanha de bônus google-ai-pro-10-first (Schema A)
-- Objetivo: Masterclass para os 10 primeiros pagantes PIX confirmados do Google AI Pro.
--
-- Funcionamento:
-- - Aloca 10 vagas para o curso bônus (metodo-ia-criativa).
-- - O webhook detecta GAIP por course.slug e chama allocate_first_n_bonus.
-- - A função verifica allocated_count < max_allocations antes de inserir em bonus_allocations.
--
-- Esta migration é:
-- - Idempotente: ON CONFLICT (slug) DO NOTHING.
-- - Validada: aborta se o schema não for Schema A ou se o curso de bônus não existir.

BEGIN;

-- ============================================================
-- 1. Validação do schema: bonus_campaigns deve ter Schema A
-- ============================================================
DO $$
DECLARE
  _col text;
  _missing_cols text[] := ARRAY[]::text[];
BEGIN
  FOR _col IN
    SELECT unnest(ARRAY[
      'slug','name','bonus_type','bonus_target',
      'max_allocations','allocated_count',
      'is_active','starts_at','ends_at',
      'created_at','updated_at'
    ])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'bonus_campaigns'
        AND column_name  = _col
    ) THEN
      _missing_cols := array_append(_missing_cols, _col);
    END IF;
  END LOOP;

  IF _missing_cols IS NOT NULL AND array_length(_missing_cols, 1) IS NOT NULL THEN
    RAISE EXCEPTION
      'Schema A de bonus_campaigns nao esta disponivel; seed nao aplicada. Colunas ausentes: %',
      array_to_string(_missing_cols, ', ');
  END IF;
END $$;


-- ============================================================
-- 2. Validação: existe exatamente 1 curso publicado de bônus
-- ============================================================
DO $$
DECLARE
  _count integer;
BEGIN
  SELECT COUNT(*) INTO _count
  FROM public.courses
  WHERE slug        = 'metodo-ia-criativa'
    AND is_published = true;

  IF _count = 0 THEN
    RAISE EXCEPTION 'Curso publicado metodo-ia-criativa nao encontrado; campanha nao criada.';
  END IF;

  IF _count > 1 THEN
    RAISE EXCEPTION 'Mais de um curso encontrado para metodo-ia-criativa; campanha nao criada.';
  END IF;
END $$;


-- ============================================================
-- 3. Inserção da campanha (idempotente)
-- ============================================================
INSERT INTO public.bonus_campaigns (
  id,
  slug,
  name,
  bonus_type,
  bonus_target,
  max_allocations,
  allocated_count,
  is_active,
  starts_at,
  ends_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  'google-ai-pro-10-first',
  'Google AI Pro — Masterclass para os 10 primeiros PIX confirmados',
  'masterclass_enrollment',
  c.id,
  10,
  0,
  true,
  now(),
  NULL,
  now(),
  now()
FROM public.courses AS c
WHERE c.slug         = 'metodo-ia-criativa'
  AND c.is_published = true
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 4. Validação pós-inserção
-- ============================================================
DO $$
DECLARE
  _campaign_id    uuid;
  _bonus_target  uuid;
  _max_alloc     integer;
  _alloc_count   integer;
  _is_active     boolean;
  _course_id     uuid;
BEGIN
  SELECT
    id,              bonus_target,
    max_allocations, allocated_count,
    is_active
  INTO
    _campaign_id,    _bonus_target,
    _max_alloc,      _alloc_count,
    _is_active
  FROM public.bonus_campaigns
  WHERE slug = 'google-ai-pro-10-first';

  IF _campaign_id IS NULL THEN
    RAISE EXCEPTION 'Campanha google-ai-pro-10-first nao foi criada; rollback efetuado.';
  END IF;

  IF _max_alloc <> 10 THEN
    RAISE EXCEPTION 'Campanha criada com max_allocations incorreto: % (esperado 10)', _max_alloc;
  END IF;

  IF _alloc_count <> 0 THEN
    RAISE EXCEPTION 'Campanha criada com allocated_count diferente de 0: %', _alloc_count;
  END IF;

  IF NOT _is_active THEN
    RAISE EXCEPTION 'Campanha criada com is_active=false.';
  END IF;

  -- bonus_target deve referenciar o curso published metodo-ia-criativa
  SELECT id INTO _course_id
  FROM public.courses
  WHERE slug         = 'metodo-ia-criativa'
    AND is_published = true;

  IF _bonus_target <> _course_id THEN
    RAISE EXCEPTION
      'bonus_target da campanha (%) nao corresponde ao curso metodo-ia-criativa published (%); rollback efetuado.',
      _bonus_target, _course_id;
  END IF;

  RAISE NOTICE 'Campanha google-ai-pro-10-first validada com sucesso. ID: %', _campaign_id;
END $$;


COMMIT;
