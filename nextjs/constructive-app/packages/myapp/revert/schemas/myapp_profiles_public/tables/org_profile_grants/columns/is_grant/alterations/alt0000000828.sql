-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/columns/is_grant/alterations/alt0000000828


ALTER TABLE myapp_profiles_public.org_profile_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


