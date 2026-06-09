-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/is_active/alterations/alt0000000701


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN is_active DROP DEFAULT;


