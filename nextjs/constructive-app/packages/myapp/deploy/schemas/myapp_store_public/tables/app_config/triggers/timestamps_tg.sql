-- Deploy: schemas/myapp_store_public/tables/app_config/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_store_public.app_config
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

