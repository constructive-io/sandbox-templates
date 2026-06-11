-- Revert: schemas/myapp_profiles_public/tables/org_profiles/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_profiles_public.org_profiles FROM authenticated;


