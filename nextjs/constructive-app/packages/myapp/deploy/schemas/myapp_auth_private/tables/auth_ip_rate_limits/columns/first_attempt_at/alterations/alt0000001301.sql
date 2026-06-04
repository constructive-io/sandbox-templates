-- Deploy: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/first_attempt_at/alterations/alt0000001301
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/first_attempt_at/column


COMMENT ON COLUMN myapp_auth_private.auth_ip_rate_limits.first_attempt_at IS E'Timestamp of the first attempt in the current window; NULL means no active window';

