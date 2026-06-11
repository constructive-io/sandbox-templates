-- Verify: schemas/myapp_profiles_public/tables/org_profiles/indexes/org_profiles_created_at_idx


SELECT verify_index('myapp_profiles_public.org_profiles', 'org_profiles_created_at_idx');


