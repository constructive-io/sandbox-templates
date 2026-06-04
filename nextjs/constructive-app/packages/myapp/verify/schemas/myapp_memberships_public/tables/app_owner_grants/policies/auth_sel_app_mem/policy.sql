-- Verify: schemas/myapp_memberships_public/tables/app_owner_grants/policies/auth_sel_app_mem/policy


SELECT verify_policy('auth_sel_app_mem', 'myapp_memberships_public.app_owner_grants');


