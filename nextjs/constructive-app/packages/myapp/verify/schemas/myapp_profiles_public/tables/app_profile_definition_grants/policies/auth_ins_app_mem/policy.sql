-- Verify: schemas/myapp_profiles_public/tables/app_profile_definition_grants/policies/auth_ins_app_mem/policy


SELECT verify_policy('auth_ins_app_mem', 'myapp_profiles_public.app_profile_definition_grants');


