-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_api_keys/alterations/alt0000001191
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/allow_api_keys/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.allow_api_keys IS 'Whether API key creation is allowed';

