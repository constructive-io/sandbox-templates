-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/user_max_attempts/alterations/alt0000001266


ALTER TABLE myapp_auth_private.app_settings_rate_limit 
  ALTER COLUMN user_max_attempts DROP NOT NULL;


