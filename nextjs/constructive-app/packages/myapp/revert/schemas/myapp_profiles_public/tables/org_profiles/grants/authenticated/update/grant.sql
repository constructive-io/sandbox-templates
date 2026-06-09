-- Revert: schemas/myapp_profiles_public/tables/org_profiles/grants/authenticated/update/grant


REVOKE UPDATE (name, slug, description, is_system, is_default) ON myapp_profiles_public.org_profiles FROM authenticated;


