-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/created_at/alterations/alt0000000419


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ALTER COLUMN created_at DROP DEFAULT;


