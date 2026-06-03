-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/profile_id/alterations/alt0000000415


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ALTER COLUMN profile_id DROP NOT NULL;


