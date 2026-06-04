-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/id/alterations/alt0000001252
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/id/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN id SET NOT NULL;

