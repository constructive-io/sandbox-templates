-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/updated_at/alterations/alt0000000761


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


