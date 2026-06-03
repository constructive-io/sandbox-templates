-- Verify: schemas/myapp_auth_private/tables/app_settings_auth/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_auth_private.app_settings_auth', 'select', 'authenticated');


