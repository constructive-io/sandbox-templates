-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/columns/profile_id/column


ALTER TABLE myapp_profiles_public.org_profile_grants 
  DROP COLUMN profile_id RESTRICT;


