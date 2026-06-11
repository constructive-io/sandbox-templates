-- Verify: schemas/myapp_auth_private/tables/app_settings_rate_limit/policies/auth_upd_app_mem/policy


SELECT verify_policy('auth_upd_app_mem', 'myapp_auth_private.app_settings_rate_limit');


