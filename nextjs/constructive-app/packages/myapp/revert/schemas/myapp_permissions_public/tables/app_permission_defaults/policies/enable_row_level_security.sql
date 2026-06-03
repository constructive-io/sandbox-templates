-- Revert: schemas/myapp_permissions_public/tables/app_permission_defaults/policies/enable_row_level_security


ALTER TABLE myapp_permissions_public.app_permission_defaults 
  DISABLE ROW LEVEL SECURITY;


