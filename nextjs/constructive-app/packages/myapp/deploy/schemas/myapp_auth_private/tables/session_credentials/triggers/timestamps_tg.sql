-- Deploy: schemas/myapp_auth_private/tables/session_credentials/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_auth_private.session_credentials
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

