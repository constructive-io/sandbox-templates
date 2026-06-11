-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/columns/locked_until/alterations/alt0000001357
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/columns/locked_until/column


COMMENT ON COLUMN myapp_auth_private.auth_rate_limits.locked_until IS E'Timestamp until which this subject is locked out for this action; NULL means not locked';

