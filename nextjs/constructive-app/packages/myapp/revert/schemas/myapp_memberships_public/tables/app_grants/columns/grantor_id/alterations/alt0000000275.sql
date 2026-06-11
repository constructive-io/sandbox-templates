-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/grantor_id/alterations/alt0000000275


ALTER TABLE myapp_memberships_public.app_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


