-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_grants/columns/grantor_id/column


ALTER TABLE myapp_memberships_public.app_permission_default_grants 
  DROP COLUMN grantor_id RESTRICT;


