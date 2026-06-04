-- Deploy: schemas/myapp_store_private/tables/app_secrets/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_store_private.app_secrets
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

