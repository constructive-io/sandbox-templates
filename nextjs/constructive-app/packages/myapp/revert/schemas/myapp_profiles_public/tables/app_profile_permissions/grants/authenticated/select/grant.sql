-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/grants/authenticated/select/grant


REVOKE SELECT ON myapp_profiles_public.app_profile_permissions FROM authenticated;


