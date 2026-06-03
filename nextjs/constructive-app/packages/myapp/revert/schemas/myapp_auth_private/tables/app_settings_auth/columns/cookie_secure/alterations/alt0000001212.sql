-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_secure/alterations/alt0000001212


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN cookie_secure DROP DEFAULT;


