-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/alterations/alt0000001345
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table


COMMENT ON TABLE myapp_auth_private.auth_rate_limits IS E'Tracks per-user/subject rate limiting state for auth functions using UUID subject identifiers';

