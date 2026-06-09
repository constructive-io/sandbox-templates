-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_in/alterations/alt0000001189
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_magic_link_sign_in/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_magic_link_sign_in SET DEFAULT false;

