-- Verify: schemas/myapp_permissions_public/tables/org_permission_defaults/policies/auth_sel_ent_mem/policy


SELECT verify_policy('auth_sel_ent_mem', 'myapp_permissions_public.org_permission_defaults');


