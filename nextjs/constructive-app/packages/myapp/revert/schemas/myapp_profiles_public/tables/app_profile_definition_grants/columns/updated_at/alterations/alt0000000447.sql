-- Revert: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/updated_at/alterations/alt0000000447


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


