-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/columns/is_default/alterations/alt0000000893


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN is_default DROP DEFAULT;


