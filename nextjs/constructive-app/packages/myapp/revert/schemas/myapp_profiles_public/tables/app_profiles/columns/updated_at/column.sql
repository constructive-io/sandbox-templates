-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/updated_at/column


ALTER TABLE myapp_profiles_public.app_profiles 
  DROP COLUMN updated_at RESTRICT;


