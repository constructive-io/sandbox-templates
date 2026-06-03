-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/created_at/column


ALTER TABLE myapp_memberships_public.org_memberships 
  DROP COLUMN created_at RESTRICT;


