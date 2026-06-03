-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/alterations/alt0000001305
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table


ALTER TABLE myapp_auth_private.auth_rate_limits 
  DISABLE ROW LEVEL SECURITY;

