-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_profiles_public.app_profile_permissions FROM authenticated;


