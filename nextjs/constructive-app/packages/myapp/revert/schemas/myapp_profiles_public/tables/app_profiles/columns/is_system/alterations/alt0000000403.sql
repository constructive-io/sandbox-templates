-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/is_system/alterations/alt0000000403


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN is_system DROP NOT NULL;


