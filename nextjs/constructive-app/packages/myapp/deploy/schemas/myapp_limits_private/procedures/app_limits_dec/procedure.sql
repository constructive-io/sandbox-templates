-- Deploy: schemas/myapp_limits_private/procedures/app_limits_dec/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table
-- requires: schemas/myapp_limits_public/tables/app_limit_defaults/table


CREATE FUNCTION myapp_limits_private.app_limits_dec(
  IN limitname citext,
  IN actor_id uuid DEFAULT jwt_public.current_user_id(),
  IN amount bigint DEFAULT 1
) RETURNS boolean AS $_PGFN_$
DECLARE
  max_default bigint := 0;
BEGIN
  SELECT max
  FROM myapp_limits_public.app_limit_defaults
  WHERE
    name = app_limits_dec.limitname INTO max_default;
  IF NOT (FOUND) THEN
    max_default := 0;
  END IF;
  INSERT INTO myapp_limits_public.app_limits (
    name,
    num,
    max,
    actor_id
  )
  VALUES
    (app_limits_dec.limitname, 0, max_default, app_limits_dec.actor_id)
  ON CONFLICT ON CONSTRAINT app_limits_name_actor_id_key DO NOTHING;
  UPDATE myapp_limits_public.app_limits AS l SET
  num = GREATEST(num - app_limits_dec.amount, 0)
  WHERE
    l.name = app_limits_dec.limitname AND l.actor_id = app_limits_dec.actor_id;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

