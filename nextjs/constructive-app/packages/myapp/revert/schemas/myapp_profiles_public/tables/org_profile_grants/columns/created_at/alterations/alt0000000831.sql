-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/columns/created_at/alterations/alt0000000831


ALTER TABLE myapp_profiles_public.org_profile_grants 
  ALTER COLUMN created_at DROP DEFAULT;


