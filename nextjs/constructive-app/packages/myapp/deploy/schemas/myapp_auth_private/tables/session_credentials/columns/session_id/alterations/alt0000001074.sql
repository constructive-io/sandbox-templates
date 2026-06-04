-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/session_id/alterations/alt0000001074
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/session_id/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.session_id IS 'References the session this credential authenticates';

