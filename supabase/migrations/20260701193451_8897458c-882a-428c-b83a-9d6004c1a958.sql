
CREATE OR REPLACE FUNCTION public.plan_rank(_plan text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT CASE _plan
    WHEN 'free' THEN 0
    WHEN 'starter' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'expert' THEN 3
    WHEN 'teste' THEN 99
    ELSE 0
  END;
$function$;
