-- Deploy: schemas/myapp_limits_private/procedures/org_limits_check_soft/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table


CREATE FUNCTION myapp_limits_private.org_limits_check_soft(
  IN limitname citext,
  IN user_id uuid DEFAULT jwt_public.current_user_id()
) RETURNS boolean AS $_PGFN_$
DECLARE
  rec myapp_limits_public.org_limits;
BEGIN
  UPDATE myapp_limits_public.org_limits AS l SET
  num = 0, period_credits = 0, max = plan_max + purchased_credits, window_start = pg_catalog.now()
  WHERE
    (l.name = org_limits_check_soft.limitname AND l.actor_id = org_limits_check_soft.user_id) AND (l.window_duration IS NOT NULL AND (l.window_start + l.window_duration) <= pg_catalog.now());
  SELECT *
  FROM myapp_limits_public.org_limits
  WHERE
    name = org_limits_check_soft.limitname AND actor_id = org_limits_check_soft.user_id INTO rec;
  IF NOT (FOUND) OR rec.soft_max IS NULL THEN
    RETURN false;
  END IF;
  IF rec.soft_max >= 0 AND rec.num >= rec.soft_max THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
  RETURN false;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

