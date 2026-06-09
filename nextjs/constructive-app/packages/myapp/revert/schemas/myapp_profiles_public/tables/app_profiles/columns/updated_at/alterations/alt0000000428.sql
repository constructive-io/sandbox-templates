-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/updated_at/alterations/alt0000000428


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN updated_at DROP DEFAULT;


