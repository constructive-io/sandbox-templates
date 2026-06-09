-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_grants/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.org_permission_default_grants 
  DISABLE ROW LEVEL SECURITY;


