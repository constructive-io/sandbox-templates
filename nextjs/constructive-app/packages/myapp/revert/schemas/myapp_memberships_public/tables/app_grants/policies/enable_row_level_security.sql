-- Revert: schemas/myapp_memberships_public/tables/app_grants/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.app_grants 
  DISABLE ROW LEVEL SECURITY;


