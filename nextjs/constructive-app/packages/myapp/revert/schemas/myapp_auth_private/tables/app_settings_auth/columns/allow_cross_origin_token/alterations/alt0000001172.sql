-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_cross_origin_token/alterations/alt0000001172


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_cross_origin_token DROP DEFAULT;


