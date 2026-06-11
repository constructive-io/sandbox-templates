-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/columns/created_at/alterations/alt0000000478


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN created_at DROP DEFAULT;


