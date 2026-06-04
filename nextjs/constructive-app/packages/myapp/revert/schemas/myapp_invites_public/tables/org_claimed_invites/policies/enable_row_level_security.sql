-- Revert: schemas/myapp_invites_public/tables/org_claimed_invites/policies/enable_row_level_security


ALTER TABLE myapp_invites_public.org_claimed_invites 
  DISABLE ROW LEVEL SECURITY;


