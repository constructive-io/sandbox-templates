-- Verify: schemas/myapp_permissions_public/tables/org_permissions/policies/auth_ins_app_mem/policy


SELECT verify_policy('auth_ins_app_mem', 'myapp_permissions_public.org_permissions');


