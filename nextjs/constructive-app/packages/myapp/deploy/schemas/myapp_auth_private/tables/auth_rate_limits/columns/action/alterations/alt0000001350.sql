-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/columns/action/alterations/alt0000001350
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/columns/action/column


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN action SET NOT NULL;

