-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_sign_up/alterations/alt0000001169
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_sign_up/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_sign_up IS E'Master switch: whether new user registration is allowed';

