-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/is_external/column


ALTER TABLE myapp_memberships_public.org_memberships 
  DROP COLUMN is_external RESTRICT;


