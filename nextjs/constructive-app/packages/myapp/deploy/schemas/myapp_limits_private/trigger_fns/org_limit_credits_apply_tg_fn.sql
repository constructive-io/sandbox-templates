-- Deploy: schemas/myapp_limits_private/trigger_fns/org_limit_credits_apply_tg_fn
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table


CREATE FUNCTION myapp_limits_private.org_limit_credits_apply_tg_fn() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_limit_name text;
BEGIN
  SELECT name
  FROM myapp_limits_public.org_limit_defaults
  WHERE
    id = NEW.default_limit_id INTO v_limit_name;
  IF NOT (FOUND) THEN
    RAISE WARNING 'INVALID_DEFAULT_LIMIT_ID';
  END IF;
  IF NEW.credit_type = 'permanent' THEN
    UPDATE myapp_limits_public.org_limits SET
    purchased_credits = purchased_credits + NEW.amount, max = ((plan_max + purchased_credits) + NEW.amount) + period_credits
    WHERE
      name = v_limit_name AND actor_id = NEW.actor_id;
  ELSE
    UPDATE myapp_limits_public.org_limits SET
    period_credits = period_credits + NEW.amount, max = (plan_max + purchased_credits) + (period_credits + NEW.amount)
    WHERE
      name = v_limit_name AND actor_id = NEW.actor_id;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

