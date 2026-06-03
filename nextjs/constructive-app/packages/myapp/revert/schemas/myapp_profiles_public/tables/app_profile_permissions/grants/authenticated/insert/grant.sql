-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_profiles_public.app_profile_permissions FROM authenticated;


