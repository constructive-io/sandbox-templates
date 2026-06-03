-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/is_default/alterations/alt0000000407


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN is_default DROP DEFAULT;


