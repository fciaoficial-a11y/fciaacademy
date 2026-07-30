
WITH dups AS (
  SELECT user_id, reference_id, count(*) - 1 AS extra, max(amount) AS amount
  FROM public.xp_log
  WHERE reason = 'module_complete' AND reference_id IS NOT NULL
  GROUP BY user_id, reference_id
  HAVING count(*) > 1
), adj AS (
  INSERT INTO public.xp_log (user_id, amount, reason, reference_id)
  SELECT user_id, -(extra * amount), 'ajuste_duplicidade_module_complete', reference_id
  FROM dups
  RETURNING user_id, amount
)
UPDATE public.profiles p
SET xp = GREATEST(0, p.xp + s.delta),
    updated_at = now()
FROM (SELECT user_id, sum(amount) AS delta FROM adj GROUP BY user_id) s
WHERE p.id = s.user_id;
