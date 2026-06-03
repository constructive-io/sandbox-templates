-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/columns/attempts/alterations/alt0000001313
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/columns/attempts/column


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN attempts SET NOT NULL;

