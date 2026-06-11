-- Revert: schemas/myapp_invites_public/tables/org_invites/policies/enable_row_level_security


ALTER TABLE myapp_invites_public.org_invites 
  DISABLE ROW LEVEL SECURITY;


