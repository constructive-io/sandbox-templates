-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/max_sessions_per_user/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


ALTER TABLE myapp_auth_private.app_settings_auth 
  ADD COLUMN max_sessions_per_user integer;

