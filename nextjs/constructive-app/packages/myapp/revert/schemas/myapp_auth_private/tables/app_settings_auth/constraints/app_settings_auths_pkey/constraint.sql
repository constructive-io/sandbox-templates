-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/constraints/app_settings_auths_pkey/constraint


ALTER TABLE myapp_auth_private.app_settings_auth 
  DROP CONSTRAINT app_settings_auths_pkey;


