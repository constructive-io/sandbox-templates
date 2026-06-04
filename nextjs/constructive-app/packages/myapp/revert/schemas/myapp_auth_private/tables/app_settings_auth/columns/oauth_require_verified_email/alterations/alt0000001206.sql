-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_require_verified_email/alterations/alt0000001206


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN oauth_require_verified_email DROP DEFAULT;


