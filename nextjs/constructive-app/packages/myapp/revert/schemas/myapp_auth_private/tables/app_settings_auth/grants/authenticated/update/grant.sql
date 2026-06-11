-- Revert: schemas/myapp_auth_private/tables/app_settings_auth/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_auth_private.app_settings_auth FROM authenticated;


