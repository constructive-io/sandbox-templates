-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_auth_private.app_settings_auth
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

