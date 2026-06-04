-- Revert: schemas/myapp_profiles_public/tables/app_profiles/grants/authenticated/select/grant


REVOKE SELECT ON myapp_profiles_public.app_profiles FROM authenticated;


