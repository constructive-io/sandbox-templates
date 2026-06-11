-- Revert: schemas/myapp_profiles_public/tables/app_profile_definition_grants/grants/authenticated/select/grant


REVOKE SELECT ON myapp_profiles_public.app_profile_definition_grants FROM authenticated;


