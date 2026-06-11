-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/name/alterations/alt0000000413


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN name DROP NOT NULL;


