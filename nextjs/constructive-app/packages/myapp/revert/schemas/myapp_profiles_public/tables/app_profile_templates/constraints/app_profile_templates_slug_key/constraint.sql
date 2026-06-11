-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/constraints/app_profile_templates_slug_key/constraint


ALTER TABLE myapp_profiles_public.app_profile_templates 
  DROP CONSTRAINT app_profile_templates_slug_key;


