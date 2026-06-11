-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/columns/description/column


ALTER TABLE myapp_profiles_public.app_profile_templates 
  DROP COLUMN description RESTRICT;


