-- Deploy: schemas/myapp_store_private/tables/app_secrets/triggers/app_secrets_insert_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table
-- requires: schemas/myapp_store_private/trigger_fns/app_secrets_hash


CREATE TRIGGER app_secrets_insert_tg
BEFORE INSERT ON myapp_store_private.app_secrets
FOR EACH ROW
EXECUTE PROCEDURE myapp_store_private.app_secrets_hash ( );

