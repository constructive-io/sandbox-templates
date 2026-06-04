-- Verify: schemas/myapp_memberships_public/tables/app_grants/policies/auth_ins_app_mem/policy


SELECT verify_policy('auth_ins_app_mem', 'myapp_memberships_public.app_grants');


