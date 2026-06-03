-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/name/column


ALTER TABLE myapp_profiles_public.app_profiles 
  DROP COLUMN name RESTRICT;


