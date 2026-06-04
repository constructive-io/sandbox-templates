-- Deploy: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/attempts/alterations/alt0000001298
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/attempts/column


ALTER TABLE myapp_auth_private.auth_ip_rate_limits 
  ALTER COLUMN attempts SET NOT NULL;

