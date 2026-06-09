-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_api_keys/alterations/alt0000001225


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_api_keys DROP DEFAULT;


