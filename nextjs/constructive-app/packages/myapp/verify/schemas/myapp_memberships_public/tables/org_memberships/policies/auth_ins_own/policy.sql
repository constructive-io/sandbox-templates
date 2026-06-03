-- Verify: schemas/myapp_memberships_public/tables/org_memberships/policies/auth_ins_own/policy


SELECT verify_policy('auth_ins_own', 'myapp_memberships_public.org_memberships');


