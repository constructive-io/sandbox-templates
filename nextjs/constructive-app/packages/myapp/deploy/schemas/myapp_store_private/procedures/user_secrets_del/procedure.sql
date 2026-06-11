-- Deploy: schemas/myapp_store_private/procedures/user_secrets_del/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table


CREATE FUNCTION myapp_store_private.user_secrets_del(
  IN owner_id uuid,
  IN secret_name text
) RETURNS void AS $_PGFN_$
BEGIN
  DELETE FROM myapp_store_private.user_secrets AS s
  WHERE
    s.owner_id = user_secrets_del.owner_id AND s.name = user_secrets_del.secret_name;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

