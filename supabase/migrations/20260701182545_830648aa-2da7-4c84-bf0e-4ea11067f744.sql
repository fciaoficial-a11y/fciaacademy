CREATE OR REPLACE FUNCTION public.grant_paid_access(_user_id UUID, _plan_id TEXT, _course_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT := COALESCE(NULLIF(_plan_id, ''), 'free');
  v_track UUID;
  v_subscription_id UUID;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_required';
  END IF;

  SELECT id INTO v_subscription_id
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND status = 'active'
    AND provider = 'asaas'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY started_at DESC
  LIMIT 1;

  IF v_subscription_id IS NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, provider, started_at, expires_at)
    VALUES (_user_id, v_plan, 'active', 'asaas', now(), now() + interval '30 days');
  ELSE
    UPDATE public.subscriptions
       SET plan_id = v_plan,
           status = 'active',
           expires_at = now() + interval '30 days',
           updated_at = now()
     WHERE id = v_subscription_id;
  END IF;

  UPDATE public.profiles
     SET plan = v_plan,
         updated_at = now()
   WHERE id = _user_id;

  IF _course_id IS NOT NULL THEN
    SELECT track_id INTO v_track FROM public.courses WHERE id = _course_id;
    INSERT INTO public.enrollments (user_id, course_id, track_id, plan_at_enrollment)
    VALUES (_user_id, _course_id, v_track, v_plan)
    ON CONFLICT (user_id, course_id)
      DO UPDATE SET plan_at_enrollment = v_plan,
                    last_accessed_at = now(),
                    updated_at = now();
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_paid_access(UUID, TEXT, UUID) TO service_role;