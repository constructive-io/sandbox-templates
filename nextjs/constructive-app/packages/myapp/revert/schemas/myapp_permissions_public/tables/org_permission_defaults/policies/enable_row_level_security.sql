-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/policies/enable_row_level_security


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  DISABLE ROW LEVEL SECURITY;


