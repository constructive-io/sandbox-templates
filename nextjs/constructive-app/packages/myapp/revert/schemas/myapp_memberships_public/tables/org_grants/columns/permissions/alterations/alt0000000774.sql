-- Revert: schemas/myapp_memberships_public/tables/org_grants/columns/permissions/alterations/alt0000000774


ALTER TABLE myapp_memberships_public.org_grants 
  ALTER COLUMN permissions DROP NOT NULL;


