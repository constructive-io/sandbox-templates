-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/columns/attempts/alterations/alt0000001354
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/columns/attempts/column


COMMENT ON COLUMN myapp_auth_private.auth_rate_limits.attempts IS 'Number of attempts from this subject for this action within the current rate limit window';

