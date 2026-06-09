-- Revert: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/grantor_id/alterations/alt0000000457


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


