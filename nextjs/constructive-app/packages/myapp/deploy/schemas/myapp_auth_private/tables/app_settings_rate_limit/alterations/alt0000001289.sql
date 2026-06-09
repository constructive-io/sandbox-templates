-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/alterations/alt0000001289
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  DISABLE ROW LEVEL SECURITY;

