-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/columns/created_at/alterations/alt0000000895


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN created_at DROP DEFAULT;


