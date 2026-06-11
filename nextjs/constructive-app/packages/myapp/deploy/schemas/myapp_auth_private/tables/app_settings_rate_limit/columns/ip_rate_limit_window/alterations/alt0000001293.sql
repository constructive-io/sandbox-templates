-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_rate_limit_window/alterations/alt0000001293
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_rate_limit_window/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN ip_rate_limit_window SET NOT NULL;

