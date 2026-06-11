-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/constraints/app_profile_templates_pkey/constraint


ALTER TABLE myapp_profiles_public.app_profile_templates 
  DROP CONSTRAINT app_profile_templates_pkey;


