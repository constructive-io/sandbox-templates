-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/columns/updated_at/column


ALTER TABLE myapp_profiles_public.org_profile_grants 
  DROP COLUMN updated_at RESTRICT;


