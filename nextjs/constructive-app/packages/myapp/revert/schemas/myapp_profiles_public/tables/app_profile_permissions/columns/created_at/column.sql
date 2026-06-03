-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/created_at/column


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  DROP COLUMN created_at RESTRICT;


