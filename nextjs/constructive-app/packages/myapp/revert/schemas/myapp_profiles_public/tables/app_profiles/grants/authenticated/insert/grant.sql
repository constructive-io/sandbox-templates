-- Revert: schemas/myapp_profiles_public/tables/app_profiles/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_profiles_public.app_profiles FROM authenticated;


