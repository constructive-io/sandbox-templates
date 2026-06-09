-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/origin/alterations/alt0000001088
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/origin/column


COMMENT ON COLUMN myapp_auth_private.sessions.origin IS E'The origin (protocol + host) from which the session was created, used for fingerprint validation';

