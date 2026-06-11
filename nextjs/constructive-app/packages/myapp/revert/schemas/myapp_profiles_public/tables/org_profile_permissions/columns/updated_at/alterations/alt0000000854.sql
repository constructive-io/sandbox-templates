-- Revert: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/updated_at/alterations/alt0000000854


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  ALTER COLUMN updated_at DROP DEFAULT;


