-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DISABLE ROW LEVEL SECURITY;


