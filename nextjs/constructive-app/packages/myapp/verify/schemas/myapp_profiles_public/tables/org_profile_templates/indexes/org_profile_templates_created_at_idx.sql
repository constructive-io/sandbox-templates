-- Verify: schemas/myapp_profiles_public/tables/org_profile_templates/indexes/org_profile_templates_created_at_idx


SELECT verify_index('myapp_profiles_public.org_profile_templates', 'org_profile_templates_created_at_idx');


