-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/alterations/alt0000001208
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_error_redirect_path/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN oauth_error_redirect_path SET NOT NULL;

