-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/alterations/alt0000001206
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN oauth_require_verified_email SET DEFAULT true;

