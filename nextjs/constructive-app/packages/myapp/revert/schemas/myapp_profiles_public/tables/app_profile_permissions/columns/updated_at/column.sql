-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/updated_at/column


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  DROP COLUMN updated_at RESTRICT;


