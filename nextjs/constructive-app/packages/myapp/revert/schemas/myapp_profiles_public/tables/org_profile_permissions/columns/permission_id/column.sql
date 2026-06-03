-- Revert: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/permission_id/column


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  DROP COLUMN permission_id RESTRICT;


