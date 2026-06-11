-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_anonymous_sessions/alterations/alt0000001150


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_anonymous_sessions DROP DEFAULT;


