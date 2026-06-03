-- Deploy: schemas/myapp_auth_private/tables/session_credentials/columns/org_id/alterations/alt0000001084
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/columns/org_id/column


COMMENT ON COLUMN myapp_auth_private.session_credentials.org_id IS E'Scopes this API key to a specific organization; NULL means app-level';

