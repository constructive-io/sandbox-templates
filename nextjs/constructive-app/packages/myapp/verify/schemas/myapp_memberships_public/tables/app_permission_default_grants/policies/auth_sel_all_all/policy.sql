-- Verify: schemas/myapp_memberships_public/tables/app_permission_default_grants/policies/auth_sel_all_all/policy


SELECT verify_policy('auth_sel_all_all', 'myapp_memberships_public.app_permission_default_grants');


