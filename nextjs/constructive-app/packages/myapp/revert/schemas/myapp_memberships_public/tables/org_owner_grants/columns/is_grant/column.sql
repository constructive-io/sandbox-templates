-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/is_grant/column


ALTER TABLE myapp_memberships_public.org_owner_grants 
  DROP COLUMN is_grant RESTRICT;


