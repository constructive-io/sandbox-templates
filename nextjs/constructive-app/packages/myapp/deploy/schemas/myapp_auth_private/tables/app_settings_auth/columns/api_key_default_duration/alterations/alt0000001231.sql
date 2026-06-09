-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/api_key_default_duration/alterations/alt0000001231
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/api_key_default_duration/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN api_key_default_duration SET DEFAULT '90 days'::interval;

