-- Verify: schemas/myapp_memberships_public/tables/org_membership_defaults/policies/auth_del_ent_mem/policy


SELECT verify_policy('auth_del_ent_mem', 'myapp_memberships_public.org_membership_defaults');


