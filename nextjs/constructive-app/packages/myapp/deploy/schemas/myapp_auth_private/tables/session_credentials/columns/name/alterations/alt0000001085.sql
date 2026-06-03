-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/name/alterations/alt0000001085
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/name/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.name IS E'User-provided display name for this credential (e.g. My CI Key)';

