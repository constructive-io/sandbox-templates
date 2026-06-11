-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/is_system/column


ALTER TABLE myapp_profiles_public.app_profiles 
  DROP COLUMN is_system RESTRICT;


