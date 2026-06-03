-- Revert: schemas/myapp_memberships_public/tables/org_members/columns/is_admin/alterations/alt0000000715


ALTER TABLE myapp_memberships_public.org_members 
  ALTER COLUMN is_admin DROP DEFAULT;


