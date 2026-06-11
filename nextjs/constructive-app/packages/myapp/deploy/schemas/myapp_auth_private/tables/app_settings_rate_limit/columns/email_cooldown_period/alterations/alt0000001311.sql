-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/alterations/alt0000001311
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/email_cooldown_period/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN email_cooldown_period SET NOT NULL;

