-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/slug/alterations/alt0000000415


ALTER TABLE myapp_profiles_public.app_profiles 
  ALTER COLUMN slug DROP NOT NULL;


