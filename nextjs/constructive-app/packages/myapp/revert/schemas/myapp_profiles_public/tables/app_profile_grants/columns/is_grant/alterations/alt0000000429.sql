-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/columns/is_grant/alterations/alt0000000429


ALTER TABLE myapp_profiles_public.app_profile_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


