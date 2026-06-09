-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/access_level/alterations/alt0000001127
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/access_level/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.access_level IS E'Access level for this credential: full_access (read+write) or read_only (SET TRANSACTION READ ONLY)';

