-- Revert: schemas/myapp_profiles_public/tables/org_profile_definition_grants/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_profiles_public.org_profile_definition_grants FROM authenticated;


