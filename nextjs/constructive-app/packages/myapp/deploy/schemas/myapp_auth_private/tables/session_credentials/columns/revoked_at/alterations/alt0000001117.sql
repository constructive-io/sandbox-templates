-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/revoked_at/alterations/alt0000001117
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/revoked_at/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.revoked_at IS E'When this credential was explicitly revoked; NULL means active';

