-- Revert: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/id/alterations/alt0000000812


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  ALTER COLUMN id DROP DEFAULT;


