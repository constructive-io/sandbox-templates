-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/id/alterations/alt0000000393


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN id DROP NOT NULL;


