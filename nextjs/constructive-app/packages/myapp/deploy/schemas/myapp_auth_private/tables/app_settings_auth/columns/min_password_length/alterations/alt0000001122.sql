-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/min_password_length/alterations/alt0000001122
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/min_password_length/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.min_password_length IS 'Minimum number of characters required for user passwords';

