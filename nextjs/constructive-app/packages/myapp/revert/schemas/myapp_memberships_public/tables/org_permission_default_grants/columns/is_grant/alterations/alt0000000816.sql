-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_grants/columns/is_grant/alterations/alt0000000816


ALTER TABLE myapp_memberships_public.org_permission_default_grants 
  ALTER COLUMN is_grant DROP DEFAULT;


