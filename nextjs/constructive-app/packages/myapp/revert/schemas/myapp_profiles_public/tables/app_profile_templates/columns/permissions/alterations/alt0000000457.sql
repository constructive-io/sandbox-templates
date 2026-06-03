-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/columns/permissions/alterations/alt0000000457


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN permissions DROP NOT NULL;


