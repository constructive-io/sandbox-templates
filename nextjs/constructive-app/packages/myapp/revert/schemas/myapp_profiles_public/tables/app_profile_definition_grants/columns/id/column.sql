-- Revert: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/id/column


ALTER TABLE myapp_profiles_public.app_profile_definition_grants 
  DROP COLUMN id RESTRICT;


