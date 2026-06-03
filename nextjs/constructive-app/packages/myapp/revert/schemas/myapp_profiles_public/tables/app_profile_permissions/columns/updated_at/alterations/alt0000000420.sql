-- Revert: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/updated_at/alterations/alt0000000420


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ALTER COLUMN updated_at DROP DEFAULT;


