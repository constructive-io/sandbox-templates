-- Revert: schemas/myapp_profiles_public/tables/org_profile_permissions/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_profiles_public.org_profile_permissions FROM authenticated;


