-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_up/alterations/alt0000001141


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_magic_link_sign_up DROP NOT NULL;


