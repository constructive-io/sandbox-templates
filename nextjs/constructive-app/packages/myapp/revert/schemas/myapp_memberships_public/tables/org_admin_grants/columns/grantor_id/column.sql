-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/grantor_id/column


ALTER TABLE myapp_memberships_public.org_admin_grants 
  DROP COLUMN grantor_id RESTRICT;


