-- Verify: schemas/myapp_profiles_public/tables/org_profiles/policies/auth_del_com/policy


SELECT verify_policy('auth_del_com', 'myapp_profiles_public.org_profiles');


