-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_state_max_age/alterations/alt0000001203
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_state_max_age/column


ALTER TABLE myapp_auth_private.app_settings_auth 
  ALTER COLUMN oauth_state_max_age SET DEFAULT '10 minutes'::interval;

