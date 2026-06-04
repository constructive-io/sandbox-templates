-- Verify: schemas/myapp_memberships_public/tables/org_memberships/policies/auth_sel_ent_mem/policy


SELECT verify_policy('auth_sel_ent_mem', 'myapp_memberships_public.org_memberships');


