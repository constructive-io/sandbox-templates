-- Revert: schemas/myapp_profiles_public/tables/app_profiles/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_profiles_public.app_profiles FROM authenticated;


