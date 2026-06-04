-- Revert: schemas/myapp_memberships_public/tables/org_grants/columns/id/column


ALTER TABLE myapp_memberships_public.org_grants 
  DROP COLUMN id RESTRICT;


