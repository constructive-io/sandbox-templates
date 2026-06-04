-- Revert: schemas/myapp_memberships_public/tables/org_membership_defaults/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  DISABLE ROW LEVEL SECURITY;


