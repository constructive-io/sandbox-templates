-- Verify: schemas/myapp_memberships_public/tables/app_memberships/policies/auth_upd_app_mem/policy


SELECT verify_policy('auth_upd_app_mem', 'myapp_memberships_public.app_memberships');


