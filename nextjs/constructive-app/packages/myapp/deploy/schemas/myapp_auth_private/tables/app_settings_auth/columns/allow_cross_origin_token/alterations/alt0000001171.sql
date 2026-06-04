-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_cross_origin_token/alterations/alt0000001171
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_cross_origin_token/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN allow_cross_origin_token SET NOT NULL;

