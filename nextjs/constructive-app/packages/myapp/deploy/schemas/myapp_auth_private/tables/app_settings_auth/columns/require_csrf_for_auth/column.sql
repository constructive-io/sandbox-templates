-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/require_csrf_for_auth/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


ALTER TABLE myapp_auth_private.app_settings_auth 
  ADD COLUMN require_csrf_for_auth boolean;

