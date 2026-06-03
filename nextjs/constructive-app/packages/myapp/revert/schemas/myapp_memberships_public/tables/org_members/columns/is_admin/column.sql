-- Revert: schemas/myapp_memberships_public/tables/org_members/columns/is_admin/column


ALTER TABLE myapp_memberships_public.org_members 
  DROP COLUMN is_admin RESTRICT;


