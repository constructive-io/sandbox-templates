-- Verify: schemas/myapp_profiles_public/tables/app_profiles/policies/auth_upd_com/policy


SELECT verify_policy('auth_upd_com', 'myapp_profiles_public.app_profiles');


