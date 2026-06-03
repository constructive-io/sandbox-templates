-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/triggers/app_settings_auth_insert_trg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


CREATE TRIGGER app_settings_auth_insert_trg
BEFORE INSERT ON myapp_auth_private.app_settings_auth
FOR EACH ROW
EXECUTE PROCEDURE utils.ensure_singleton ( );

