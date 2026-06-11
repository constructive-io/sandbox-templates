-- Verify: schemas/myapp_profiles_public/tables/app_profiles/policies/auth_del_com/policy


SELECT verify_policy('auth_del_com', 'myapp_profiles_public.app_profiles');


