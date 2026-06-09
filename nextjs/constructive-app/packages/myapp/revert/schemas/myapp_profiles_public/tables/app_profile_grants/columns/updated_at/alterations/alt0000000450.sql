-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/columns/updated_at/alterations/alt0000000450


ALTER TABLE myapp_profiles_public.app_profile_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


