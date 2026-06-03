-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/created_at/alterations/alt0000001284


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN created_at DROP DEFAULT;


