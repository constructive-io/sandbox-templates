-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_profiles_public.app_profile_grants FROM authenticated;


