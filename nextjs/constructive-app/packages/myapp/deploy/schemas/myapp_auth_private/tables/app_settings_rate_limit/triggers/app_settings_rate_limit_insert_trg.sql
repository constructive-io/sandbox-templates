-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/triggers/app_settings_rate_limit_insert_trg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE TRIGGER app_settings_rate_limit_insert_trg
BEFORE INSERT ON myapp_auth_private.app_settings_rate_limit
FOR EACH ROW
EXECUTE PROCEDURE utils.ensure_singleton ( );

