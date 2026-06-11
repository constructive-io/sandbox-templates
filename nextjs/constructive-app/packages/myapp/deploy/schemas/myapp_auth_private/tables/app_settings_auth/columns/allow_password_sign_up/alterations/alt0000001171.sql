-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_password_sign_up/alterations/alt0000001171
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_password_sign_up/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_password_sign_up SET DEFAULT true;

