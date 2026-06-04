-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/uagent/alterations/alt0000001057
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/uagent/column


COMMENT ON COLUMN myapp_auth_private.sessions.uagent IS E'User-Agent string from the client, used for strict fingerprint validation';

