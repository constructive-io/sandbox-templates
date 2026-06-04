-- Deploy: schemas/myapp_store_public/procedures/app_secrets_del/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


CREATE FUNCTION myapp_store_public.app_secrets_del(
  IN secret_name text,
  IN secret_namespace text DEFAULT 'default'
) RETURNS void AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
BEGIN
  SELECT ns.id
  FROM myapp_infra_public.app_namespaces AS ns
  WHERE
    ns.name = app_secrets_del.secret_namespace INTO v_namespace_id;
  DELETE FROM myapp_store_private.app_secrets AS s
  WHERE
    s.namespace_id = v_namespace_id AND s.name = app_secrets_del.secret_name;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

