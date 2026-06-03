-- Deploy: schemas/myapp_infra_private/trigger_fns/app_namespaces_rename_proxy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_private/schema


CREATE FUNCTION myapp_infra_private.app_namespaces_rename_proxy() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  SELECT inflection_db.get_namespace_name(ARRAY['myapp', NEW.name]) INTO NEW.namespace_name;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

