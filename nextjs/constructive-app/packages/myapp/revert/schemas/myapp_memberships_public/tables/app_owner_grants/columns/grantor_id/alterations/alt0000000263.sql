-- Revert: schemas/myapp_memberships_public/tables/app_owner_grants/columns/grantor_id/alterations/alt0000000263


ALTER TABLE myapp_memberships_public.app_owner_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


