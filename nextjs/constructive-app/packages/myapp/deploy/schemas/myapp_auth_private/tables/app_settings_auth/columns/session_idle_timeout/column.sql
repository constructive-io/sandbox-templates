-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/session_idle_timeout/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


ALTER TABLE myapp_auth_private.app_settings_auth 
  ADD COLUMN session_idle_timeout interval;

