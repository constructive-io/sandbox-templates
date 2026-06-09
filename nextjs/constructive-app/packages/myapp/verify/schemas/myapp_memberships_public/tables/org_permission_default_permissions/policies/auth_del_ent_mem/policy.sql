-- Verify: schemas/myapp_memberships_public/tables/org_permission_default_permissions/policies/auth_del_ent_mem/policy


SELECT verify_policy('auth_del_ent_mem', 'myapp_memberships_public.org_permission_default_permissions');


