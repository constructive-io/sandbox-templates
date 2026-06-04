-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/triggers/app_namespaces_rename_proxy_update_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_private/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_private/trigger_fns/app_namespaces_rename_proxy


CREATE TRIGGER app_namespaces_rename_proxy_update_tg
BEFORE UPDATE ON myapp_infra_public.app_namespaces
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE PROCEDURE myapp_infra_private.app_namespaces_rename_proxy ( );

