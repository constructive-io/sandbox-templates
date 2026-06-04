-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_fingerprint_mode/alterations/alt0000001113
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/default_fingerprint_mode/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.default_fingerprint_mode IS E'Default fingerprint validation mode for new sessions: strict, lax, or none';

