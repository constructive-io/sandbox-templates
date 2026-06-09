-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/columns/slug/alterations/alt0000000886


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN slug DROP NOT NULL;


