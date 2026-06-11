-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/granted/column


ALTER TABLE myapp_memberships_public.org_memberships 
  DROP COLUMN granted RESTRICT;


