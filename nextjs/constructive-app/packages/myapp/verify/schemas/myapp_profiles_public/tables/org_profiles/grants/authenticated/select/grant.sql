-- Verify: schemas/myapp_profiles_public/tables/org_profiles/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_profiles_public.org_profiles', 'select', 'authenticated');


