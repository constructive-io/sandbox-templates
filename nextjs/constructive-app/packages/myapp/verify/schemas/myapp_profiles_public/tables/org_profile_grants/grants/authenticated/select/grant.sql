-- Verify: schemas/myapp_profiles_public/tables/org_profile_grants/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_profiles_public.org_profile_grants', 'select', 'authenticated');


