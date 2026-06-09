-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/columns/grantor_id/alterations/alt0000000445


ALTER TABLE myapp_profiles_public.app_profile_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


