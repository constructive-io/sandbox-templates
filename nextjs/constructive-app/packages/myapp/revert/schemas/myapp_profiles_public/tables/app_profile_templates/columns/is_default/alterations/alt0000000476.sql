-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/columns/is_default/alterations/alt0000000476


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN is_default DROP DEFAULT;


