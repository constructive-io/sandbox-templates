-- Deploy: schemas/myapp_auth_private/tables/session_secrets/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_auth_private.session_secrets
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

