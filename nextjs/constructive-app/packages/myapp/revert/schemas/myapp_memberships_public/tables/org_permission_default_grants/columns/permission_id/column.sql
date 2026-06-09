-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_grants/columns/permission_id/column


ALTER TABLE myapp_memberships_public.org_permission_default_grants 
  DROP COLUMN permission_id RESTRICT;


