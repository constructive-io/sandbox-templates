-- Deploy: schemas/myapp_limits_private/procedures/org_limits_modify/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table


CREATE FUNCTION myapp_limits_private.org_limits_modify(
  IN limitname citext,
  IN delta bigint,
  IN reason text DEFAULT '',
  IN user_id uuid DEFAULT jwt_public.current_user_id()
) RETURNS boolean AS $_PGFN_$
DECLARE
  max_default bigint := 0;
BEGIN
  SELECT max
  FROM myapp_limits_public.org_limit_defaults
  WHERE
    name = org_limits_modify.limitname INTO max_default;
  IF NOT (FOUND) THEN
    max_default := 0;
  END IF;
  INSERT INTO myapp_limits_public.org_limits (
    name,
    num,
    max,
    actor_id
  )
  VALUES
    (org_limits_modify.limitname, 0, max_default, org_limits_modify.user_id)
  ON CONFLICT ON CONSTRAINT org_limits_name_actor_id_key DO NOTHING;
  UPDATE myapp_limits_public.org_limits SET
  max = max + org_limits_modify.delta
  WHERE
    name = org_limits_modify.limitname AND actor_id = org_limits_modify.user_id;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

