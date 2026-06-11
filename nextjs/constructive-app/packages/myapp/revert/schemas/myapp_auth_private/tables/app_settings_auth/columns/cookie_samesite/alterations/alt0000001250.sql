-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_samesite/alterations/alt0000001250


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN cookie_samesite DROP DEFAULT;


