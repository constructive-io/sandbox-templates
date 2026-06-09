-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/columns/updated_at/alterations/alt0000000896


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN updated_at DROP DEFAULT;


