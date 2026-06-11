-- Deploy: schemas/myapp_store_private/procedures/app_config_get/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


CREATE FUNCTION myapp_store_private.app_config_get(
  IN config_name text,
  IN default_value text DEFAULT NULL,
  IN config_namespace text DEFAULT 'default'
) RETURNS text AS $_PGFN_$
DECLARE
  v_namespace_id uuid;
  v_value text;
BEGIN
  SELECT ns.id
  FROM myapp_infra_public.app_namespaces AS ns
  WHERE
    ns.name = app_config_get.config_namespace INTO v_namespace_id;
  SELECT c.value
  FROM myapp_store_public.app_config AS c
  WHERE
    c.namespace_id = v_namespace_id AND c.name = app_config_get.config_name INTO v_value;
  IF NOT (FOUND) OR v_value IS NULL THEN
    RETURN app_config_get.default_value;
  END IF;
  RETURN v_value;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

