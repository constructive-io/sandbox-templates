-- Revert: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/is_grant/alterations/alt0000000459


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ALTER COLUMN is_grant DROP DEFAULT;


