-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/id/column


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  DROP COLUMN id RESTRICT;


