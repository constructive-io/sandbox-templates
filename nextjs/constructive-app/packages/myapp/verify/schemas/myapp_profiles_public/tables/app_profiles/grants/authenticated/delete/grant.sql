-- Verify: schemas/myapp_profiles_public/tables/app_profiles/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_profiles_public.app_profiles', 'delete', 'authenticated');


