-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/permissions/alterations/alt0000000713


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN permissions DROP DEFAULT;


