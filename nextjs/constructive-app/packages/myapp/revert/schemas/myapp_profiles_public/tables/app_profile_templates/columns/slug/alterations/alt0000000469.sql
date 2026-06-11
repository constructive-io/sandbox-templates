-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/columns/slug/alterations/alt0000000469


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN slug DROP NOT NULL;


