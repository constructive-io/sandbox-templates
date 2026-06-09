-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/columns/id/alterations/alt0000000442


ALTER TABLE myapp_profiles_public.app_profile_grants 
  ALTER COLUMN id DROP DEFAULT;


