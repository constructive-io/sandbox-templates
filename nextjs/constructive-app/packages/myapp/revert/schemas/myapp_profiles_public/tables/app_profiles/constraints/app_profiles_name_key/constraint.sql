-- Revert: schemas/myapp_profiles_public/tables/app_profiles/constraints/app_profiles_name_key/constraint


ALTER TABLE myapp_profiles_public.app_profiles 
  DROP CONSTRAINT app_profiles_name_key;


