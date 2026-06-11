-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/permissions/alterations/alt0000000418


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN permissions DROP NOT NULL;


