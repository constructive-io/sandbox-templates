-- Verify: schemas/myapp_profiles_public/tables/app_profile_grants/indexes/app_profile_grants_updated_at_idx


SELECT verify_index('myapp_profiles_public.app_profile_grants', 'app_profile_grants_updated_at_idx');


