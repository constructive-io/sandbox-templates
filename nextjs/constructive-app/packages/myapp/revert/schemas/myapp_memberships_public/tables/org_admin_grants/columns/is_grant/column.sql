-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/is_grant/column


ALTER TABLE myapp_memberships_public.org_admin_grants 
  DROP COLUMN is_grant RESTRICT;


