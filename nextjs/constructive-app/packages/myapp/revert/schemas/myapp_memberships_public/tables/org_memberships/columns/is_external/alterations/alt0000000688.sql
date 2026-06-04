-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/is_external/alterations/alt0000000688


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN is_external DROP NOT NULL;


