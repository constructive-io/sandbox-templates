-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/columns/membership_id/column


ALTER TABLE myapp_profiles_public.org_profile_grants 
  DROP COLUMN membership_id RESTRICT;


