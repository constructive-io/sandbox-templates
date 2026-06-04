-- Verify: schemas/myapp_memberships_public/tables/app_memberships/policies/auth_del_app_mem/policy


SELECT verify_policy('auth_del_app_mem', 'myapp_memberships_public.app_memberships');


