-- Verify: schemas/myapp_profiles_public/tables/org_profile_grants/policies/auth_ins_ent_mem/policy


SELECT verify_policy('auth_ins_ent_mem', 'myapp_profiles_public.org_profile_grants');


