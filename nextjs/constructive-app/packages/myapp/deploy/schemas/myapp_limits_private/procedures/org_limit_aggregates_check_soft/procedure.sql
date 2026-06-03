-- Deploy: schemas/myapp_limits_private/procedures/org_limit_aggregates_check_soft/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


CREATE FUNCTION myapp_limits_private.org_limit_aggregates_check_soft(
  IN limitname citext,
  IN entity_id uuid
) RETURNS boolean AS $_PGFN_$
DECLARE
  rec myapp_limits_public.org_limit_aggregates;
BEGIN
  UPDATE myapp_limits_public.org_limit_aggregates AS l SET
  num = 0, period_credits = 0, max = plan_max + purchased_credits, window_start = pg_catalog.now()
  WHERE
    (l.name = org_limit_aggregates_check_soft.limitname AND l.entity_id = org_limit_aggregates_check_soft.entity_id) AND (l.window_duration IS NOT NULL AND (l.window_start + l.window_duration) <= pg_catalog.now());
  SELECT *
  FROM myapp_limits_public.org_limit_aggregates
  WHERE
    name = org_limit_aggregates_check_soft.limitname AND entity_id = org_limit_aggregates_check_soft.entity_id INTO rec;
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

