-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


GRANT SELECT ON myapp_auth_private.app_settings_rate_limit TO authenticated;

