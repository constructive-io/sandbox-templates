-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/ip/alterations/alt0000001090
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/ip/column


COMMENT ON COLUMN myapp_auth_private.sessions.ip IS E'IP address from which the session was created, used for strict fingerprint validation';

