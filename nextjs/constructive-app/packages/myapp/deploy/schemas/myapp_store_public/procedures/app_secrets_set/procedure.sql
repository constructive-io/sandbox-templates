-- Deploy: schemas/myapp_store_public/procedures/app_secrets_set/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


CREATE FUNCTION myapp_store_public.app_secrets_set(
  IN secret_name text,
  IN secret_value text,
  IN algo text DEFAULT 'pgp',
  IN secret_namespace text DEFAULT 'default'
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
BEGIN
  SELECT ns.id
  FROM myapp_infra_public.app_namespaces AS ns
  WHERE
    ns.name = app_secrets_set.secret_namespace INTO v_namespace_id;
  INSERT INTO myapp_store_private.app_secrets (
    namespace_id,
    name,
    value,
    algo
  )
  VALUES
    (v_namespace_id, app_secrets_set.secret_name, app_secrets_set.secret_value::bytea, app_secrets_set.algo)
  ON CONFLICT (namespace_id, name) DO UPDATE SET
  value = app_secrets_set.secret_value::bytea, algo = EXCLUDED.algo;
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

