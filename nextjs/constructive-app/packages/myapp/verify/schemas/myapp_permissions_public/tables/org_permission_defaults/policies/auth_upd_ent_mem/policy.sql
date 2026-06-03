-- Verify: schemas/myapp_permissions_public/tables/org_permission_defaults/policies/auth_upd_ent_mem/policy


SELECT verify_policy('auth_upd_ent_mem', 'myapp_permissions_public.org_permission_defaults');


