-- Revert: schemas/myapp_profiles_public/tables/app_profiles/grants/authenticated/update/grant


REVOKE UPDATE (name, slug, description, is_system, is_default) ON myapp_profiles_public.app_profiles FROM authenticated;


