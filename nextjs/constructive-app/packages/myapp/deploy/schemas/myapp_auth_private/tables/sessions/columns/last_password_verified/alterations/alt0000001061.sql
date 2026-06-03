-- Deploy: schemas/myapp_auth_private/tables/sessions/columns/last_password_verified/alterations/alt0000001061
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/columns/last_password_verified/column


COMMENT ON COLUMN myapp_auth_private.sessions.last_password_verified IS E'Timestamp of last password re-verification for step-up authentication';

