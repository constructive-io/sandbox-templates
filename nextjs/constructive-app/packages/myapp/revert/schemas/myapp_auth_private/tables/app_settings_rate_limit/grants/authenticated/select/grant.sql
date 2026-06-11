-- Revert: schemas/myapp_auth_private/tables/app_settings_rate_limit/grants/authenticated/select/grant


REVOKE SELECT ON myapp_auth_private.app_settings_rate_limit FROM authenticated;


