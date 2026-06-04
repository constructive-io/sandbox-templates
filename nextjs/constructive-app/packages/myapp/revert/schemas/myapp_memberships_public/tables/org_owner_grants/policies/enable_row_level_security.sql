-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.org_owner_grants 
  DISABLE ROW LEVEL SECURITY;


