-- Revert: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/id/column


ALTER TABLE myapp_profiles_public.org_profile_permissions 
  DROP COLUMN id RESTRICT;


