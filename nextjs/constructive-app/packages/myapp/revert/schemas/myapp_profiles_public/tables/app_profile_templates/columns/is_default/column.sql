-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/columns/is_default/column


ALTER TABLE myapp_profiles_public.app_profile_templates 
  DROP COLUMN is_default RESTRICT;


