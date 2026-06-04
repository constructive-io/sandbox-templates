-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/grantor_id/alterations/alt0000000746


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN grantor_id DROP DEFAULT;


