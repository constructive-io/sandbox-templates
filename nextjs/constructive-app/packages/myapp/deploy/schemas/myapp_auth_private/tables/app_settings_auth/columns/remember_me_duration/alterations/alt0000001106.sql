-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/remember_me_duration/alterations/alt0000001106
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/remember_me_duration/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN remember_me_duration SET DEFAULT '30 days'::interval;

