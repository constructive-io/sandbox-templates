-- Verify: schemas/myapp_profiles_public/tables/app_profiles/indexes/app_profiles_is_default_idx


SELECT verify_index('myapp_profiles_public.app_profiles', 'app_profiles_is_default_idx');


