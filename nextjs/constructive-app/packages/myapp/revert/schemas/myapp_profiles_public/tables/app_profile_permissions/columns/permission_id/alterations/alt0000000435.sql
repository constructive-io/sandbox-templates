-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/permission_id/alterations/alt0000000435


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ALTER COLUMN permission_id DROP NOT NULL;


