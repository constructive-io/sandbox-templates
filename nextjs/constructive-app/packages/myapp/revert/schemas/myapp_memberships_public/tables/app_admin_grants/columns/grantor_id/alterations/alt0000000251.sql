-- Revert: schemas/myapp_memberships_public/tables/app_admin_grants/columns/grantor_id/alterations/alt0000000251


ALTER TABLE myapp_memberships_public.app_admin_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


