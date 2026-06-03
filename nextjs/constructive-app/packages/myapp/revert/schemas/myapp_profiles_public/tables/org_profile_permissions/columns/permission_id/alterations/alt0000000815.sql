-- Revert: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/permission_id/alterations/alt0000000815


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  ALTER COLUMN permission_id DROP NOT NULL;


