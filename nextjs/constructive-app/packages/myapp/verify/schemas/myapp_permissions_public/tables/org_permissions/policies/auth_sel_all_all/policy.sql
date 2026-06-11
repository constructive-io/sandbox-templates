-- Verify: schemas/myapp_permissions_public/tables/org_permissions/policies/auth_sel_all_all/policy


SELECT verify_policy('auth_sel_all_all', 'myapp_permissions_public.org_permissions');


