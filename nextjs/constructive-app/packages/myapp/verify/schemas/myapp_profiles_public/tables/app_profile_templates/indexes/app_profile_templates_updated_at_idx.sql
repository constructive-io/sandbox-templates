-- Verify: schemas/myapp_profiles_public/tables/app_profile_templates/indexes/app_profile_templates_updated_at_idx


SELECT verify_index('myapp_profiles_public.app_profile_templates', 'app_profile_templates_updated_at_idx');


