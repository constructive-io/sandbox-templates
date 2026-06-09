-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_permissions/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.app_permission_default_permissions 
  DISABLE ROW LEVEL SECURITY;


