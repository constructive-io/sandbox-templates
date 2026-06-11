-- Deploy: schemas/myapp_limits_private/procedures/org_limit_aggregates_transfer_quota/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


CREATE FUNCTION myapp_limits_private.org_limit_aggregates_transfer_quota(
  IN limitname citext,
  IN source_entity_id uuid,
  IN dest_entity_id uuid,
  IN amount bigint
) RETURNS boolean AS $_PGFN_$
DECLARE
  max_default bigint := 0;
  rec myapp_limits_public.org_limit_aggregates;
BEGIN
  SELECT max
  FROM myapp_limits_public.org_limit_defaults
  WHERE
    name = org_limit_aggregates_transfer_quota.limitname INTO max_default;
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
    (org_limit_aggregates_transfer_quota.limitname, 0, max_default, org_limit_aggregates_transfer_quota.source_entity_id)
  ON CONFLICT ON CONSTRAINT org_limit_aggregates_name_entity_id_key DO NOTHING;
  INSERT INTO myapp_limits_public.org_limit_aggregates (
    name,
    num,
    max,
    entity_id
  )
  VALUES
    (org_limit_aggregates_transfer_quota.limitname, 0, max_default, org_limit_aggregates_transfer_quota.dest_entity_id)
  ON CONFLICT ON CONSTRAINT org_limit_aggregates_name_entity_id_key DO NOTHING;
  SELECT *
  FROM myapp_limits_public.org_limit_aggregates
  WHERE
    name = org_limit_aggregates_transfer_quota.limitname AND entity_id = org_limit_aggregates_transfer_quota.source_entity_id
  FOR UPDATE INTO rec;
  IF NOT (FOUND) THEN
    RETURN false;
  END IF;
  IF rec.max >= 0 AND rec.max < org_limit_aggregates_transfer_quota.amount THEN
    RETURN false;
  END IF;
  UPDATE myapp_limits_public.org_limit_aggregates SET
  max = max - org_limit_aggregates_transfer_quota.amount
  WHERE
    name = org_limit_aggregates_transfer_quota.limitname AND entity_id = org_limit_aggregates_transfer_quota.source_entity_id;
  UPDATE myapp_limits_public.org_limit_aggregates SET
  max = max + org_limit_aggregates_transfer_quota.amount
  WHERE
    name = org_limit_aggregates_transfer_quota.limitname AND entity_id = org_limit_aggregates_transfer_quota.dest_entity_id;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

