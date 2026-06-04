-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/created_at/column


ALTER TABLE myapp_profiles_public.app_profiles 
  DROP COLUMN created_at RESTRICT;


