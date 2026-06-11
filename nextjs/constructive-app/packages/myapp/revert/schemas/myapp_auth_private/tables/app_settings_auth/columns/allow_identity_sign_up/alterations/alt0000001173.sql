-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_identity_sign_up/alterations/alt0000001173


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_identity_sign_up DROP NOT NULL;


