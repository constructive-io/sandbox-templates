-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/columns/membership_id/alterations/alt0000000823


ALTER TABLE myapp_profiles_public.org_profile_grants 
  ALTER COLUMN membership_id DROP NOT NULL;


