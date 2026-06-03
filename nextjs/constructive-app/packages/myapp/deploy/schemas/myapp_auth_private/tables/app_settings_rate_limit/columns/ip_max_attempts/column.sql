-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_max_attempts/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ADD COLUMN ip_max_attempts int;

