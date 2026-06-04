-- Revert: schemas/myapp_invites_public/tables/app_invites/policies/enable_row_level_security


ALTER TABLE myapp_invites_public.app_invites 
  DISABLE ROW LEVEL SECURITY;


