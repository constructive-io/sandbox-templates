-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/id/alterations/alt0000000432


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ALTER COLUMN id DROP DEFAULT;


