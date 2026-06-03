-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/columns/membership_id/alterations/alt0000000425


ALTER TABLE myapp_profiles_public.app_profile_grants 
  ALTER COLUMN membership_id DROP NOT NULL;


