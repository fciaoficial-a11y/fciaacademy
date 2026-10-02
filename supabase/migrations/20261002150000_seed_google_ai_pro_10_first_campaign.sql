-- Seed: google-ai-pro-10-first campaign
-- Timing: after 20261002135200_create_bonus_infrastructure_fk_fixed.sql

BEGIN;

INSERT INTO public.bonus_campaigns (
  id,
  slug,
  name,
  bonus_type,
  bonus_target,
  max_allocations,
  allocated_count,
  starts_at,
  ends_at,
  is_active,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'google-ai-pro-10-first',
  'Google AI Pro — Masterclass para os 10 primeiros PIX confirmados',
  'masterclass_enrollment',
  '136f4678-51a8-452c-a7ce-39b0f870f597',
  10,
  0,
  now(),
  NULL,
  true,
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- Validate inserted campaign
DO $$
DECLARE
  row_count INTEGER;
  camp RECORD;
BEGIN
  SELECT
    slug,
    bonus_type,
    bonus_target,
    max_allocations,
    allocated_count,
    is_active
  INTO camp
  FROM public.bonus_campaigns
  WHERE slug = 'google-ai-pro-10-first';

  SELECT COUNT(*) INTO row_count
  FROM public.bonus_campaigns
  WHERE slug = 'google-ai-pro-10-first';

  IF row_count != 1 THEN
    RAISE EXCEPTION 'Expected exactly 1 campaign with slug google-ai-pro-10-first, found %', row_count;
  END IF;

  IF camp.slug != 'google-ai-pro-10-first' THEN
    RAISE EXCEPTION 'slug mismatch';
  END IF;
  IF camp.bonus_type != 'masterclass_enrollment' THEN
    RAISE EXCEPTION 'bonus_type mismatch: got %', camp.bonus_type;
  END IF;
  IF camp.bonus_target != '136f4678-51a8-452c-a7ce-39b0f870f597' THEN
    RAISE EXCEPTION 'bonus_target mismatch: got %', camp.bonus_target;
  END IF;
  IF camp.max_allocations != 10 THEN
    RAISE EXCEPTION 'max_allocations mismatch: got %', camp.max_allocations;
  END IF;
  IF camp.allocated_count != 0 THEN
    RAISE EXCEPTION 'allocated_count mismatch: got %', camp.allocated_count;
  END IF;
  IF camp.is_active != true THEN
    RAISE EXCEPTION 'is_active mismatch: got %', camp.is_active;
  END IF;
END $$;

COMMIT;
