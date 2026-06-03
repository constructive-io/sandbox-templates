-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/columns/locked_until/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ADD COLUMN locked_until timestamptz;

