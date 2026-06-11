-- Revert: schemas/myapp_permissions_public/tables/org_permissions/policies/enable_row_level_security


ALTER TABLE myapp_permissions_public.org_permissions 
  DISABLE ROW LEVEL SECURITY;


