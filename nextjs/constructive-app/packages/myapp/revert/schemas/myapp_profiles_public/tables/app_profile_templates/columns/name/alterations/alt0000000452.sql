-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/columns/name/alterations/alt0000000452


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN name DROP NOT NULL;


