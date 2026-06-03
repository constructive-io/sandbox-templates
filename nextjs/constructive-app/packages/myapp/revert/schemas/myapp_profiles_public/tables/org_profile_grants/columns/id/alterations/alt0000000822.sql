-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/columns/id/alterations/alt0000000822


ALTER TABLE myapp_profiles_public.org_profile_grants 
  ALTER COLUMN id DROP DEFAULT;


