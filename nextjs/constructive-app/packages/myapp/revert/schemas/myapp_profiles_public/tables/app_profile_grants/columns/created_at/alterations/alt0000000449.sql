-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/columns/created_at/alterations/alt0000000449


ALTER TABLE myapp_profiles_public.app_profile_grants 
  ALTER COLUMN created_at DROP DEFAULT;


