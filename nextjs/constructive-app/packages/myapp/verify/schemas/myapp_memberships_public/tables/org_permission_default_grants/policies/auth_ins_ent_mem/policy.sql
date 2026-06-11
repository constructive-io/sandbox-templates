-- Verify: schemas/myapp_memberships_public/tables/org_permission_default_grants/policies/auth_ins_ent_mem/policy


SELECT verify_policy('auth_ins_ent_mem', 'myapp_memberships_public.org_permission_default_grants');


