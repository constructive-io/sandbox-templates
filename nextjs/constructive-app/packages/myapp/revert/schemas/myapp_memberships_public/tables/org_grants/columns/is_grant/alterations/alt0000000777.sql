-- Revert: schemas/myapp_memberships_public/tables/org_grants/columns/is_grant/alterations/alt0000000777


ALTER TABLE myapp_memberships_public.org_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


