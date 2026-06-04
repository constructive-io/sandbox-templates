-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_lockout_duration/alterations/alt0000001269
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_lockout_duration/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN user_lockout_duration SET NOT NULL;

