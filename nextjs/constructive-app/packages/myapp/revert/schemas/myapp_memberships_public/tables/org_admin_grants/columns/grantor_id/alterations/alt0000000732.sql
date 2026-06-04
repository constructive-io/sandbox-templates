-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/grantor_id/alterations/alt0000000732


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


