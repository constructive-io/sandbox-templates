-- Verify: schemas/myapp_profiles_public/tables/org_profile_grants/indexes/org_profile_grants_membership_id_idx


SELECT verify_index('myapp_profiles_public.org_profile_grants', 'org_profile_grants_membership_id_idx');


