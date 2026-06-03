-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_rate_limit_window/alterations/alt0000001264
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_rate_limit_window/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN user_rate_limit_window SET DEFAULT '15 minutes'::interval;

