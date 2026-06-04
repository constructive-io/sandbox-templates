-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_auth_private.app_settings_rate_limit
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

