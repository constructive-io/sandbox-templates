-- Deploy: schemas/myapp_store_private/procedures/user_secrets_set/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table


CREATE FUNCTION myapp_store_private.user_secrets_set(
  IN user_id uuid,
  IN secret_name text,
  IN secret_value text,
  IN algo text DEFAULT 'pgp'
) RETURNS boolean AS $_PGFN_$
BEGIN
  INSERT INTO myapp_store_private.user_secrets (
    owner_id,
    name,
    value,
    algo
  )
  VALUES
    (user_secrets_set.user_id, user_secrets_set.secret_name, user_secrets_set.secret_value::bytea, user_secrets_set.algo)
  ON CONFLICT (owner_id, name) DO UPDATE SET
  value = user_secrets_set.secret_value::bytea, algo = EXCLUDED.algo;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

