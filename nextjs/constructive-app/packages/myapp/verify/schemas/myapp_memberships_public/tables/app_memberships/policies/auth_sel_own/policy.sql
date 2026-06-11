-- Verify: schemas/myapp_memberships_public/tables/app_memberships/policies/auth_sel_own/policy


SELECT verify_policy('auth_sel_own', 'myapp_memberships_public.app_memberships');


