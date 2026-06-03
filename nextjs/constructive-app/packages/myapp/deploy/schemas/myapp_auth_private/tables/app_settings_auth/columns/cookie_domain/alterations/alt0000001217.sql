-- Deploy: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_domain/alterations/alt0000001217
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/columns/cookie_domain/column


COMMENT ON COLUMN myapp_auth_private.app_settings_auth.cookie_domain IS E'Domain scope for the auth cookie (e.g. .example.com); NULL uses the request origin';

