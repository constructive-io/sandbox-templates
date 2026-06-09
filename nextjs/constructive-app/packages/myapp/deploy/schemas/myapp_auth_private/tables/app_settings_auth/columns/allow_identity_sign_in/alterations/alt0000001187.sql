-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_identity_sign_in/alterations/alt0000001187
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_identity_sign_in/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_identity_sign_in IS E'Whether identity sign-in is allowed';

