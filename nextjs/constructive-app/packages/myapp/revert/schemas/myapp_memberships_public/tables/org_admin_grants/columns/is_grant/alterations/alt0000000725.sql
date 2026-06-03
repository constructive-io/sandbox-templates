-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/is_grant/alterations/alt0000000725


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


