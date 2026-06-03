-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/columns/is_grant/column


ALTER TABLE myapp_profiles_public.app_profile_grants 
  DROP COLUMN is_grant RESTRICT;


