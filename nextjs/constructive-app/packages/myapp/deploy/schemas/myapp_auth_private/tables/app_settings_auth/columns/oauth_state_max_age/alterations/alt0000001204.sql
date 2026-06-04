-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_state_max_age/alterations/alt0000001204
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/oauth_state_max_age/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.oauth_state_max_age IS E'How long the HMAC-signed OAuth state token is valid before expiring; controls CSRF protection window for OAuth flows';

