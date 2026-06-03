-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/columns/id/alterations/alt0000000850


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN id DROP DEFAULT;


