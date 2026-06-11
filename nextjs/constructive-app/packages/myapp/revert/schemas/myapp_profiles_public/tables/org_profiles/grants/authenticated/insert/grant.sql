-- Revert: schemas/myapp_profiles_public/tables/org_profiles/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_profiles_public.org_profiles FROM authenticated;


