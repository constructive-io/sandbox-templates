-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/is_disabled/column


ALTER TABLE myapp_memberships_public.org_memberships 
  DROP COLUMN is_disabled RESTRICT;


