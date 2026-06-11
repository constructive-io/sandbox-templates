-- Revert: schemas/myapp_memberships_public/tables/org_grants/columns/permissions/column


ALTER TABLE myapp_memberships_public.org_grants 
  DROP COLUMN permissions RESTRICT;


