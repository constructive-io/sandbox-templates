-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/min_password_length/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table


ALTER TABLE myapp_auth_private.app_settings_auth 
  ADD COLUMN min_password_length int;

