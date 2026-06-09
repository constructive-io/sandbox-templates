-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/csrf_secret/alterations/alt0000001098
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/csrf_secret/column


COMMENT ON COLUMN myapp_auth_private.sessions.csrf_secret IS E'Secret used to generate and validate CSRF tokens for cookie-based sessions';

