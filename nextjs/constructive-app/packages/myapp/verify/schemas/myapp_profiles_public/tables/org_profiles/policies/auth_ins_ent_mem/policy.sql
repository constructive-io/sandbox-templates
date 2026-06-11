-- Verify: schemas/myapp_profiles_public/tables/org_profiles/policies/auth_ins_ent_mem/policy


SELECT verify_policy('auth_ins_ent_mem', 'myapp_profiles_public.org_profiles');


