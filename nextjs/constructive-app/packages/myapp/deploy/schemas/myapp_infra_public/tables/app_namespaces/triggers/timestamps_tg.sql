-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_infra_public.app_namespaces
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

