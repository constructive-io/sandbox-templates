-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/slug/column


ALTER TABLE myapp_profiles_public.app_profiles 
  DROP COLUMN slug RESTRICT;


