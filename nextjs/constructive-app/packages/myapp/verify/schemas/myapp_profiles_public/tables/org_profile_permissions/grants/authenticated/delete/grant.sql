-- Verify: schemas/myapp_profiles_public/tables/org_profile_permissions/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_profiles_public.org_profile_permissions', 'delete', 'authenticated');


