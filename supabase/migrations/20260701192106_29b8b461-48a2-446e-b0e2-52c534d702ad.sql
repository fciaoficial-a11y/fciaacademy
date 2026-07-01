
CREATE TABLE public.gateway_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT,
  payment_id TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

GRANT ALL ON public.gateway_events TO service_role;

ALTER TABLE public.gateway_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read gateway events"
  ON public.gateway_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.grant_paid_access(_user_id uuid, _plan_id text, _course_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan TEXT := COALESCE(NULLIF(_plan_id, ''), 'free');
  v_track UUID;
  v_subscription_id UUID;
  v_expires TIMESTAMPTZ;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_required';
  END IF;

  SELECT id, expires_at INTO v_subscription_id, v_expires
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
    -- Only extend when subscription is close to expiring (< 25 days remaining).
    -- Prevents stacking +30 days on webhook retries or CONFIRMED+RECEIVED double events.
    UPDATE public.subscriptions
       SET plan_id = v_plan,
           status = 'active',
           expires_at = CASE
             WHEN v_expires IS NULL OR v_expires < now() + interval '25 days'
               THEN now() + interval '30 days'
             ELSE v_expires
           END,
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
$function$;
