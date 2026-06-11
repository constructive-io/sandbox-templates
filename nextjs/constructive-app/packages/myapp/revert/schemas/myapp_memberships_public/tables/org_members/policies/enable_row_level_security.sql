-- Revert: schemas/myapp_memberships_public/tables/org_members/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.org_members 
  DISABLE ROW LEVEL SECURITY;


