-- Verify: schemas/myapp_permissions_public/tables/app_permissions/policies/auth_upd_app_mem/policy


SELECT verify_policy('auth_upd_app_mem', 'myapp_permissions_public.app_permissions');


