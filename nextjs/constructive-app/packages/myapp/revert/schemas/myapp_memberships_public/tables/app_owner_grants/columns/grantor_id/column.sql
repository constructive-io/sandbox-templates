-- Revert: schemas/myapp_memberships_public/tables/app_owner_grants/columns/grantor_id/column


ALTER TABLE myapp_memberships_public.app_owner_grants 
  DROP COLUMN grantor_id RESTRICT;


