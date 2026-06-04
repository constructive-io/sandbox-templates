-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/expires_at/alterations/alt0000001050
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/expires_at/column


COMMENT ON COLUMN myapp_auth_private.sessions.expires_at IS 'When this session expires and can no longer be used for authentication';

