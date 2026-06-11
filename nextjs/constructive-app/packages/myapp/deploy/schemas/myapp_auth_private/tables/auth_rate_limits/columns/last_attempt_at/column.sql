-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/columns/last_attempt_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ADD COLUMN last_attempt_at timestamptz;

