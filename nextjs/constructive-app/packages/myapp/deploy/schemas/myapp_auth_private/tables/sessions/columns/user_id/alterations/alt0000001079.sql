-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/user_id/alterations/alt0000001079
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/user_id/column


COMMENT ON COLUMN myapp_auth_private.sessions.user_id IS E'References the authenticated user; NULL for anonymous sessions';

