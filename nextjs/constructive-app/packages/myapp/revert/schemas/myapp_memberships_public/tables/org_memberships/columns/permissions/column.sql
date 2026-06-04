-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/permissions/column


ALTER TABLE myapp_memberships_public.org_memberships 
  DROP COLUMN permissions RESTRICT;


