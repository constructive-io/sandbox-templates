-- Revert: schemas/myapp_profiles_public/tables/org_profiles/grants/authenticated/select/grant


REVOKE SELECT ON myapp_profiles_public.org_profiles FROM authenticated;


