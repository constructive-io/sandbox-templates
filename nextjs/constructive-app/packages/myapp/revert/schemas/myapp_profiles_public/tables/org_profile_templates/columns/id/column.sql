-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/columns/id/column


ALTER TABLE myapp_profiles_public.org_profile_templates 
  DROP COLUMN id RESTRICT;


