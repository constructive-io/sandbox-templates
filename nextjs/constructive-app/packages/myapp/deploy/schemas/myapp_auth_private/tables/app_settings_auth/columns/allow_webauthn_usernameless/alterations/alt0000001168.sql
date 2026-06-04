-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_webauthn_usernameless/alterations/alt0000001168
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_webauthn_usernameless/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_webauthn_usernameless SET NOT NULL;

