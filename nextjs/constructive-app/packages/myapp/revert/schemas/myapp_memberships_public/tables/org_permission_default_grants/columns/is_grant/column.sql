-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_grants/columns/is_grant/column


ALTER TABLE myapp_memberships_public.org_permission_default_grants 
  DROP COLUMN is_grant RESTRICT;


