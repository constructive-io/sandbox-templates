-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/permissions/alterations/alt0000000712


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN permissions DROP NOT NULL;


