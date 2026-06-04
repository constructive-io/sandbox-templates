-- Revert: schemas/myapp_memberships_public/tables/app_memberships/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.app_memberships 
  DISABLE ROW LEVEL SECURITY;


