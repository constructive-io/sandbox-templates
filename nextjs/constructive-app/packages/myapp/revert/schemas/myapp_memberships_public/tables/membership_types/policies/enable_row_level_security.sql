-- Revert: schemas/myapp_memberships_public/tables/membership_types/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.membership_types 
  DISABLE ROW LEVEL SECURITY;


