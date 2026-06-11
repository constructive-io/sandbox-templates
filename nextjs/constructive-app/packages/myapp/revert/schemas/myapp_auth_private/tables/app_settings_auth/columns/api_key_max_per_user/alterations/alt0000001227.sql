-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/api_key_max_per_user/alterations/alt0000001227


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN api_key_max_per_user DROP NOT NULL;


