-- Verify: schemas/myapp_profiles_public/tables/app_profile_permissions/policies/auth_upd_app_mem/policy


SELECT verify_policy('auth_upd_app_mem', 'myapp_profiles_public.app_profile_permissions');


