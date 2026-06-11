-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_session_duration/alterations/alt0000001137
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_session_duration/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN default_session_duration SET NOT NULL;

