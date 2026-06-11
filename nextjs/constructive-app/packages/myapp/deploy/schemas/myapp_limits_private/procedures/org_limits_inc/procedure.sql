-- Deploy: schemas/myapp_limits_private/procedures/org_limits_inc/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table


CREATE FUNCTION myapp_limits_private.org_limits_inc(
  IN limitname citext,
  IN entity_id uuid,
  IN actor_id uuid DEFAULT jwt_public.current_user_id(),
  IN amount bigint DEFAULT 1
) RETURNS boolean AS $_PGFN_$
DECLARE
  max_default bigint := 0;
BEGIN
  SELECT max
  FROM myapp_limits_public.org_limit_defaults
  WHERE
    name = org_limits_inc.limitname INTO max_default;
  IF NOT (FOUND) THEN
    max_default := 0;
  END IF;
  INSERT INTO myapp_limits_public.org_limits (
    name,
    num,
    max,
    actor_id,
    entity_id
  )
  VALUES
    (org_limits_inc.limitname, 0, max_default, org_limits_inc.actor_id, org_limits_inc.entity_id)
  ON CONFLICT ON CONSTRAINT org_limits_name_actor_id_entity_id_key DO NOTHING;
  UPDATE myapp_limits_public.org_limits AS l SET
  num = 0, period_credits = 0, max = plan_max + purchased_credits, window_start = pg_catalog.now()
  WHERE
    ((l.name = org_limits_inc.limitname AND l.actor_id = org_limits_inc.actor_id) AND l.entity_id = org_limits_inc.entity_id) AND (l.window_duration IS NOT NULL AND (l.window_start + l.window_duration) <= pg_catalog.now());
  UPDATE myapp_limits_public.org_limits AS l SET
  num = num + org_limits_inc.amount
  WHERE
    ((l.name = org_limits_inc.limitname AND l.actor_id = org_limits_inc.actor_id) AND l.entity_id = org_limits_inc.entity_id) AND (l.max < 0 OR l.max >= (l.num + org_limits_inc.amount));
  IF FOUND THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
  RETURN false;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

