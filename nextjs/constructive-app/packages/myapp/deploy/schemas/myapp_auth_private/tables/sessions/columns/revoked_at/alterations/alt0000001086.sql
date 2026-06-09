-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/revoked_at/alterations/alt0000001086
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/revoked_at/column


COMMENT ON COLUMN myapp_auth_private.sessions.revoked_at IS E'When this session was explicitly revoked (soft delete); NULL means active';

