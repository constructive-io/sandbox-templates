-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/created_at/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  DROP COLUMN created_at RESTRICT;


