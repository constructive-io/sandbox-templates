-- Verify: schemas/myapp_permissions_public/tables/org_permissions/policies/auth_upd_app_mem/policy


SELECT verify_policy('auth_upd_app_mem', 'myapp_permissions_public.org_permissions');


