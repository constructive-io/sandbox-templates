-- Deploy: schemas/myapp_limits_private/procedures/org_limit_aggregates_modify/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


CREATE FUNCTION myapp_limits_private.org_limit_aggregates_modify(
  IN limitname citext,
  IN entity_id uuid,
  IN delta bigint,
  IN reason text DEFAULT ''
) RETURNS boolean AS $_PGFN_$
DECLARE
  max_default bigint := 0;
BEGIN
  SELECT max
  FROM myapp_limits_public.org_limit_defaults
  WHERE
    name = org_limit_aggregates_modify.limitname INTO max_default;
  IF NOT (FOUND) THEN
    max_default := 0;
  END IF;
  INSERT INTO myapp_limits_public.org_limit_aggregates (
    name,
    num,
    max,
    entity_id
  )
  VALUES
    (org_limit_aggregates_modify.limitname, 0, max_default, org_limit_aggregates_modify.entity_id)
  ON CONFLICT ON CONSTRAINT org_limit_aggregates_name_entity_id_key DO NOTHING;
  UPDATE myapp_limits_public.org_limit_aggregates SET
  max = max + org_limit_aggregates_modify.delta
  WHERE
    name = org_limit_aggregates_modify.limitname AND entity_id = org_limit_aggregates_modify.entity_id;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

