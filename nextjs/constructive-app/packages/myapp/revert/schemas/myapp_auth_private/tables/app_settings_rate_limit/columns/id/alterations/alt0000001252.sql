-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/id/alterations/alt0000001252


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN id DROP NOT NULL;


