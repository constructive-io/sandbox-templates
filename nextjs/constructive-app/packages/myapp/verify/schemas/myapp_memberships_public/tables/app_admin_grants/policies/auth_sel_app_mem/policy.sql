-- Verify: schemas/myapp_memberships_public/tables/app_admin_grants/policies/auth_sel_app_mem/policy


SELECT verify_policy('auth_sel_app_mem', 'myapp_memberships_public.app_admin_grants');


