-- Revert: schemas/myapp_profiles_public/tables/org_profile_grants/columns/updated_at/alterations/alt0000000867


ALTER TABLE myapp_profiles_public.org_profile_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


