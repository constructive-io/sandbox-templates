-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/columns/permissions/alterations/alt0000000857


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN permissions DROP DEFAULT;


