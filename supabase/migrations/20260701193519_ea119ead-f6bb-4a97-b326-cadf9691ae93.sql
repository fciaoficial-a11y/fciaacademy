
ALTER TABLE public.tracks DROP CONSTRAINT IF EXISTS tracks_required_plan_check;
ALTER TABLE public.tracks ADD CONSTRAINT tracks_required_plan_check
  CHECK (required_plan = ANY (ARRAY['free','starter','pro','expert','teste']));
