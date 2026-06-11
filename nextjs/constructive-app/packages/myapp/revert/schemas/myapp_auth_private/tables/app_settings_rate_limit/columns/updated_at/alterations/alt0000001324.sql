-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/updated_at/alterations/alt0000001324


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN updated_at DROP DEFAULT;


