-- Deploy: schemas/myapp_auth_private/tables/auth_ip_rate_limits/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_auth_private.auth_ip_rate_limits
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

