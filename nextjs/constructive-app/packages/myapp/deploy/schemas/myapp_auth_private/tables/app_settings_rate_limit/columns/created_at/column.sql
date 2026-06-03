-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ADD COLUMN created_at timestamptz;

