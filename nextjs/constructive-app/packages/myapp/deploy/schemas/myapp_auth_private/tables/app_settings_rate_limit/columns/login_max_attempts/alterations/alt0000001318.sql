-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/login_max_attempts/alterations/alt0000001318
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/login_max_attempts/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN login_max_attempts SET DEFAULT 5;

