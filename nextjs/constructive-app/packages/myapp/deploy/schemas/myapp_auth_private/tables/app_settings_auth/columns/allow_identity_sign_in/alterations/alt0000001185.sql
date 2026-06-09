-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_identity_sign_in/alterations/alt0000001185
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_identity_sign_in/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_identity_sign_in SET NOT NULL;

