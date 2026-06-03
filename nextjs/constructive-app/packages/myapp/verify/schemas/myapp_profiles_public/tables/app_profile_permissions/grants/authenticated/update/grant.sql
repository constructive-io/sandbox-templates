-- Verify: schemas/myapp_profiles_public/tables/app_profile_permissions/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_profiles_public.app_profile_permissions', 'update', 'authenticated');


