-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_path/alterations/alt0000001224


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN cookie_path DROP NOT NULL;


