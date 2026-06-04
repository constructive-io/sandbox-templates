-- Verify: schemas/myapp_profiles_public/tables/org_profiles/indexes/org_profiles_default_global_uniq


SELECT verify_index('myapp_profiles_public.org_profiles', 'org_profiles_default_global_uniq');


