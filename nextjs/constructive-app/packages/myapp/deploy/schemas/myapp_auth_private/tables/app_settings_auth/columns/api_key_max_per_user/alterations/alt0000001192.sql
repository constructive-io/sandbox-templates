-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/api_key_max_per_user/alterations/alt0000001192
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/api_key_max_per_user/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN api_key_max_per_user SET NOT NULL;

