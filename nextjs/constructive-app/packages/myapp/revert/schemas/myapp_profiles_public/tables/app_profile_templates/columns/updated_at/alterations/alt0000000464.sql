-- Revert: schemas/myapp_profiles_public/tables/app_profile_templates/columns/updated_at/alterations/alt0000000464


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ALTER COLUMN updated_at DROP DEFAULT;


