-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/created_at/alterations/alt0000000427


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN created_at DROP DEFAULT;


