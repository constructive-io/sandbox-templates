-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/is_disabled/alterations/alt0000000698


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN is_disabled DROP DEFAULT;


