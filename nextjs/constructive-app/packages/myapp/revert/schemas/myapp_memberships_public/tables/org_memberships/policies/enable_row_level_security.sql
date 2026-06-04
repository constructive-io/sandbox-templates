-- Revert: schemas/myapp_memberships_public/tables/org_memberships/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.org_memberships 
  DISABLE ROW LEVEL SECURITY;


